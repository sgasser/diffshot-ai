import readline from 'readline';

// Extend readline.Interface to include the _writeToOutput method
interface ExtendedInterface extends readline.Interface {
  _writeToOutput?: (stringToWrite: string) => void;
  output: NodeJS.WritableStream;
}

export async function prompt(question: string, hideInput = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }) as ExtendedInterface;

  return new Promise((resolve) => {
    if (hideInput) {
      // Hide input for sensitive data like API keys
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });

      // Override stdin to hide characters
      rl._writeToOutput = function _writeToOutput(stringToWrite: string) {
        if (stringToWrite.includes(question)) {
          rl.output.write(stringToWrite);
        } else {
          // Replace characters with asterisks
          const masked = stringToWrite
            .split('')
            .map((char) => {
              if (char === '\n' || char === '\r') return char;
              return '*';
            })
            .join('');
          rl.output.write(masked);
        }
      };
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

export async function confirm(question: string): Promise<boolean> {
  const answer = await prompt(`${question} (y/N): `);
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}
