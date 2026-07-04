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

    const dead: Response[] = [];
    this.clients.forEach((client) => {
      try {
        client.write(formattedMessage);
      } catch (error) {
        console.error('[SSE] Dead client detected, scheduling removal:', error);
        dead.push(client);
      }
    });

    // Remove dead clients after iteration to avoid mutating the array mid-loop
    dead.forEach((client) => this.removeClient(client));
  }
}
