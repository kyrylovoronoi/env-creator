// get CLI arguments
const args = process.argv.slice(2);

if (args.length === 0) {
    process.exit(0);
}

const command = args[0];

switch (command) {
    default:
        console.error('Unknown command');
        process.exit(1);
}
