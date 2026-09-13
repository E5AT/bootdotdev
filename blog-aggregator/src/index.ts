import { CommandRegistry, registerCommand, handlerLogin, runCommand, handlerRegister, handlerReset, handlerUsers, handlerAgg, handlerAddFeed, handlerFeeds, handlerFollow, handlerFollowing, middlewareLoggedIn, handlerUnfollow, handlerBrowse } from "./commands.js";

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.error("Error: Not enough arguments provided.");
        process.exit(1);
    }

    const cmdName = args[0];
    const cmdArgs = args.slice(1);

    const registry: CommandRegistry = {};
    registerCommand(registry, "login", handlerLogin);
    registerCommand(registry, "register", handlerRegister);
    registerCommand(registry, "reset", handlerReset);
    registerCommand(registry, "users", handlerUsers);
    registerCommand(registry, "agg", handlerAgg);
    registerCommand(registry, "feeds", handlerFeeds);

    registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
    registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
    registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));
    registerCommand(registry, "unfollow", middlewareLoggedIn(handlerUnfollow));
    registerCommand(registry, "browse", middlewareLoggedIn(handlerBrowse));

    try {
        await runCommand(registry, cmdName, ...cmdArgs);
        process.exit(0);
    } catch (err: any) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
}

main();
