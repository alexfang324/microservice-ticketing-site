export const natsWrapper = {
  client: {
    publish: jest
      .fn() //allows jest to monitor if this function has been called
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      )
  }
};
