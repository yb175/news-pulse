import { PythonRunner } from '../../jobs/python-runner';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spawn } from 'child_process';
import { EventEmitter } from 'events';

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}));

describe('PythonRunner', () => {
  let runner: PythonRunner;
  let mockUpdateStatus: any;

  beforeEach(() => {
    runner = new PythonRunner();
    mockUpdateStatus = vi.fn();
    (runner as any).repository = {
      updateStatus: mockUpdateStatus,
    };
    vi.clearAllMocks();
  });

  it('should successfully launch process and transition to RUNNING', async () => {
    const mockChild: any = new EventEmitter();
    mockChild.stdout = new EventEmitter();
    mockChild.stderr = new EventEmitter();

    vi.mocked(spawn).mockReturnValue(mockChild);

    await runner.launch('job-id');

    // Should spawn python process
    expect(spawn).toHaveBeenCalledWith(
      expect.any(String),
      ['main.py'],
      expect.objectContaining({ cwd: expect.any(String) })
    );

    // Should update job to RUNNING
    expect(mockUpdateStatus).toHaveBeenCalledWith('job-id', 'RUNNING', 0);

    // Simulate process completion
    mockChild.emit('close', 0);

    // Wait for promise resolution on process close
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(mockUpdateStatus).toHaveBeenCalledWith('job-id', 'COMPLETED', expect.any(Number), expect.any(String));
  });

  it('should handle process spawn exceptions', async () => {
    vi.mocked(spawn).mockImplementation(() => {
      throw new Error('Failed to spawn');
    });

    await expect(runner.launch('job-id')).rejects.toThrow('Failed to spawn');
  });
});
