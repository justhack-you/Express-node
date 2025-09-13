const { config } = require('winston')
const winston = require('winston')

const format = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true, }),
  winston.format.cli({ colors: { info: 'cyan', debug: 'yellow' } }),
  winston.format.json(),
  winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss:ms A' }),
  winston.format.printf(info => {
    let timestamp = winston.format.colorize().colorize('info', info.timestamp)

    if (info.stack || info.level.includes('error')) {
      let stack = info.stack
      let coloredStack
      if (stack) {
        timestamp = winston.format.colorize().colorize('error', info.timestamp)
        coloredStack = stack.split('\n').map(line => winston.format.colorize().colorize('error', line));
        return `\n${timestamp} : ${info.level} - ${info.message.trim()} ${coloredStack}`

      } else {
        timestamp = winston.format.colorize().colorize('error', info.timestamp)
        return `\n${timestamp} : ${info.level} - ${info.message.trim()}`

      }
    }
    return `${timestamp} : ${info.level} - ${info.message.trim()}`
  })

)
const logger = winston.createLogger({
  levels: config.syslog.levels,
  defaultMeta: { component: 'user-service' },
  format: format,
  transports: [new winston.transports.Console({})]
})

logger.stream = {
  write: function (message, encoding) {
    // use the 'info' log level so the output will be picked up by both
    // transports (file and console)
    logger.info(message);
  },
};


module.exports = logger