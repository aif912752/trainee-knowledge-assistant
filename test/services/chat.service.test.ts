import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTestDatabase, createTestUser } from '~~/test/utils/database';

// Mock getDatabase to return our test DB
vi.mock('~~/server/db', () => ({
  getDatabase: vi.fn(),
}));

import { getDatabase } from '~~/server/db';
import { ChatService } from '~~/server/services/chat.service';

describe('ChatService', () => {
  let chatService: ChatService;
  let db: any;
  let user: any;
  let mockFetch: any;

  beforeEach(() => {
    db = createTestDatabase();
    user = createTestUser(db);
    (getDatabase as any).mockReturnValue(db);
    chatService = new ChatService();
    mockFetch = global.$fetch as any;
    mockFetch.mockReset();
  });

  it('should send a message and receive an AI response from Primary API', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    const input = { message: 'สวัสดี' };

    // Mock Primary AI (z.ai) success
    mockFetch.mockResolvedValueOnce({
      content: [{ text: 'สวัสดีจาก Primary' }],
      usage: { input_tokens: 10, output_tokens: 20 }
    });

    const result = await chatService.sendMessage(userId, input, sessionId);

    expect(result.message.content).toBe('สวัสดีจาก Primary');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://api.zai.com', expect.anything());
  });

  it('should fallback to OpenRouter if Primary API fails', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    const input = { message: 'สวัสดี' };

    // Mock Primary AI failure
    mockFetch.mockRejectedValueOnce(new Error('Primary API Down'));

    // Mock Fallback AI (OpenRouter) success
    mockFetch.mockResolvedValueOnce({
      choices: [{ message: { content: 'สวัสดีจาก Fallback' } }],
      usage: { prompt_tokens: 5, completion_tokens: 5, total_tokens: 10 }
    });

    const result = await chatService.sendMessage(userId, input, sessionId);

    expect(result.message.content).toBe('สวัสดีจาก Fallback');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    // Second call should be OpenRouter
    expect(mockFetch).toHaveBeenLastCalledWith('https://api.openrouter.ai', expect.anything());
  });

  it('should throw error if both APIs fail', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    const input = { message: 'สวัสดี' };

    // Both fail
    mockFetch.mockRejectedValue(new Error('API Failure'));

    await expect(chatService.sendMessage(userId, input, sessionId)).rejects.toThrow('API Failure');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle non-existent documentId gracefully', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    const input = { message: 'สวัสดี', documentId: 999 }; // Non-existent ID

    mockFetch.mockResolvedValueOnce({
      content: [{ text: 'สวัสดีครับ' }],
      usage: { input_tokens: 5, output_tokens: 5 }
    });

    const result = await chatService.sendMessage(userId, input, sessionId);

    expect(result.message.content).toBe('สวัสดีครับ');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // Should NOT include context since doc doesn't exist
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].body.messages[0].content).not.toContain('เนื้อหาจากไฟล์เอกสาร');
    expect(callArgs[1].body.messages[0].content).toBe('สวัสดี');
  });

  it('should include document context when documentId is provided', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    
    // Create a mock document
    db.prepare('INSERT INTO documents (user_id, filename, original_name, file_type, file_size, content) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, 'test.txt', 'test.txt', 'text/plain', 100, 'นี่คือเนื้อหาสำคัญ');
    
    const input = { message: 'สรุปให้ที', documentId: 1 };

    mockFetch.mockResolvedValueOnce({
      content: [{ text: 'นี่คือสรุปจากไฟล์ครับ' }],
      usage: { input_tokens: 15, output_tokens: 10 }
    });

    await chatService.sendMessage(userId, input, sessionId);

    // Verify $fetch was called with context
    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].body.messages[0].content).toContain('นี่คือเนื้อหาสำคัญ');
    expect(callArgs[1].body.messages[0].content).toContain('สรุปให้ที');
  });

  it('should record token usage in the database across multiple sessions', async () => {
    const userId = user.id;
    
    mockFetch.mockResolvedValue({
      content: [{ text: 'ตอบกลับ' }],
      usage: { input_tokens: 5, output_tokens: 5 }
    });

    await chatService.sendMessage(userId, { message: 'msg 1' }, 'session-1');
    await chatService.sendMessage(userId, { message: 'msg 2' }, 'session-2');

    const usage = chatService.getTokenUsage(userId);
    expect(usage.total).toBe(20); // (5+5) * 2
    expect(usage.sessions).toHaveLength(2);
    expect(usage.sessions.find(s => s.session_id === 'session-1').total_tokens).toBe(10);
    expect(usage.sessions.find(s => s.session_id === 'session-2').total_tokens).toBe(10);
  });

  it('should include truncated document context when document is very large', async () => {
    const userId = user.id;
    const sessionId = 'test-session';
    
    // Create a very large mock document (e.g., 20,000 characters)
    const largeContent = 'A'.repeat(20000);
    db.prepare('INSERT INTO documents (user_id, filename, original_name, file_type, file_size, content) VALUES (?, ?, ?, ?, ?, ?)')
      .run(userId, 'large.txt', 'large.txt', 'text/plain', 20000, largeContent);
    
    const input = { message: 'สรุป', documentId: 1 };

    mockFetch.mockResolvedValueOnce({
      content: [{ text: 'สรุปให้แล้วครับ' }],
      usage: { input_tokens: 100, output_tokens: 10 }
    });

    await chatService.sendMessage(userId, input, sessionId);

    const callArgs = mockFetch.mock.calls[0];
    const sentContent = callArgs[1].body.messages[0].content;
    
    // Check if it's truncated (we want to truncate at 10,000 characters)
    expect(sentContent.length).toBeLessThan(11000); 
    expect(sentContent).toContain('... [เนื้อหาถูกตัดเนื่องจากยาวเกินไป]');
  });

  it('should clear chat history for a user', async () => {
    const userId = user.id;
    
    mockFetch.mockResolvedValue({
      content: [{ text: 'ok' }],
      usage: { input_tokens: 1, output_tokens: 1 }
    });

    await chatService.sendMessage(userId, { message: 'hello' }, 's1');
    
    let history = chatService.getChatHistory(userId);
    expect(history.length).toBeGreaterThan(0);

    chatService.clearHistory(userId);
    
    history = chatService.getChatHistory(userId);
    expect(history).toHaveLength(0);
  });
});
