export const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: "mock-job-id" }),
  getJobs: jest.fn().mockResolvedValue([]),
  close: jest.fn().mockResolvedValue(undefined),
  getJob: jest.fn(),
  on: jest.fn(),
};
