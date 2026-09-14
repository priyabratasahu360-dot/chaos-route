const COLOR_PALETTE = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

export function colorize(message: string, color: keyof typeof COLOR_PALETTE){
    return `${COLOR_PALETTE[color]}${message}${COLOR_PALETTE.reset}`;
}