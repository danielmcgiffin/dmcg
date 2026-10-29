import net from 'node:net';
import { fileURLToPath } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
// Playground currently binds on all interfaces. Keep this admin preview local.
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  if (typeof args[0] === 'number' && (args.length === 1 || typeof args[1] === 'function')) args.splice(1, 0, '127.0.0.1');
  return listen.apply(this, args);
};
const { runCLI } = await import('@wp-playground/cli');
const site = fileURLToPath(new URL('./site/', import.meta.url));
mkdirSync(site, { recursive: true });
const initialized = existsSync(`${site}/wp-config.php`);
const options = () => ({
  command: 'server', port: 9400, login: true,
  'mount-before-install': [{ hostPath: site, vfsPath: '/wordpress' }],
  wordpressInstallMode: initialized ? 'do-not-attempt-installing' : 'download-and-install',
  ...(!initialized || process.argv.includes('--setup') ? { blueprint: fileURLToPath(new URL('./blueprint.json', import.meta.url)) } : {}),
});
const preview = await runCLI(options());
if (!initialized) {
  // Load the persisted installation in all workers before authenticating clients.
  console.log('Initial installation complete; restarting the saved local site.');
  await preview[Symbol.asyncDispose]();
  await runCLI({ ...options(), wordpressInstallMode: 'do-not-attempt-installing', blueprint: undefined });
}
