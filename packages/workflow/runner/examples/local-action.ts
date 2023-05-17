import { getInput } from 'https://raw.githubusercontent.com/elwood-studio/actions/main/core/mod.ts';

export async function main() {
  const message =
    getInput('message', false) ??
    "You didn't provide a message. So we created this one for you. Happy Day!";
  console.log(message);
}

if (import.meta.main) {
  main();
}
