import { type Client } from 'pg';

let lock = false;

export function connectDb(db: Client, callback: (state: boolean) => void) {
  db.connect()
    .then(() => {
      console.log('database connected');

      if (lock) {
        return;
      }

      lock = true;
      callback(true);
    })
    .catch((err) => {
      callback(false);
    });
}
