const Logger = {
  isLogging: true
};

Logger.log = (message) => {
  if (Logger.isLogging)
    console.log(message);
};
