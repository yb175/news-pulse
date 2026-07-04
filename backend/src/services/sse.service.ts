import { Response } from 'express';

export class SseService {
  private static clients: Response[] = [];

  static addClient(res: Response) {
    this.clients.push(res);
    console.log(`[SSE] Client connected. Total clients: ${this.clients.length}`);

    // Send headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Keep connection alive with comment
    res.write(': keep-alive\n\n');
  }

  static removeClient(res: Response) {
    this.clients = this.clients.filter((client) => client !== res);
    console.log(`[SSE] Client disconnected. Total clients: ${this.clients.length}`);
  }

  static broadcast(event: string, data: any) {
    console.log(`[SSE] Broadcasting event "${event}" to ${this.clients.length} clients`);
    const formattedMessage = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach((client) => {
      try {
        client.write(formattedMessage);
      } catch (error) {
        console.error('[SSE] Error sending message to client, client might be closed:', error);
      }
    });
  }
}
