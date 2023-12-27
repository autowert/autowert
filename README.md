## autowert (bot)

[![Official Discord](https://img.shields.io/static/v1.svg?label=OFFICIAL&message=DISCORD&color=blue&logo=discord&style=for-the-badge)](https://discord.gg/dVJFqbjc66)

A powerful Minecraft bot with the capability to deliver kits almost instantly to you, anywhere, anytime.

![An animated GIF featuring a variety of different shulker boxes that autowert has](https://github.com/autowert/autowert/assets/72566626/63574935-3081-4d9b-a920-c5e6d147635b)


#### Prerequisites
You need to have [node.js](https://nodejs.org/) and [pnpm](https://pnpm.io) installed on your local system.

If you plan to run the bot on a server, you only need Node.js and npm on the server. On Ubuntu-based servers, you can install both using `sudo apt install nodejs npm`.

It is recommended to use Node.js version 18 or higher.

### Deploying to a server
1. Clone the repository
   ```bash
   git clone https://github.com/autowert/autowert.git
   ```
2. Install packages with [pnpm](https://pnpm.io/): `pnpm install`
3. Create a bundle of the code:
   ```bash
   pnpm esbuild --bundle --minify --platform=node --target=node18.2 --packages=external src/index.ts --outfile=dist/index.js
   ```
4. Upload `package.json` and `dist/index.js` to your server
5. On the server, install packages with `npm install --production`
6. Finally, start the Bot with `node index.js`

### Contributing
1. Clone this repository and install packages (as mentioned above)
2. Modify the code,
   add descriptive comments,
   and use meaningful commit messages
3. Check for type errors with `pnpm tsc`, and test your changes with `pnpm run dev` if possible
4. Open a pull request
