import { AppDataSource } from './data-source';

const action = (process.argv[2] ?? 'run') as 'run' | 'revert';

AppDataSource.initialize()
  .then(async (ds) => {
    if (action === 'revert') {
      await ds.undoLastMigration();
      console.log('Last migration reverted.');
    } else {
      const ran = await ds.runMigrations();
      if (ran.length) console.log('Ran:', ran.map((m) => m.name).join(', '));
      else console.log('Nothing to run.');
    }
    await ds.destroy();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
