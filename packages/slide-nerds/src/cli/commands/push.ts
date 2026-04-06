import { Command } from 'commander'

export const registerPushCommand = (program: Command): void => {
  program
    .command('push')
    .description('(Deprecated) Deploy your deck to your own host and use slidenerds link --url instead')
    .action(async () => {
      console.log('Direct upload to SlideNerds has been deprecated.\n')
      console.log('Deploy your deck to Vercel, Netlify, or any static host, then register it:\n')
      console.log('  npx vercel deploy --prod')
      console.log('  slidenerds link --name my-talk --url https://my-talk.vercel.app\n')
      process.exit(1)
    })
}
