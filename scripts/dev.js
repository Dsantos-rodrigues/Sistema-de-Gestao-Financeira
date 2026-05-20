const { spawn } = require("node:child_process");
const path = require("node:path");

const root = process.cwd();
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const services = [
  {
    name: "backend",
    cwd: path.join(root, "backend"),
    args: ["run", "start:dev"],
  },
  {
    name: "frontend",
    cwd: path.join(root, "frontend"),
    args: ["run", "dev"],
  },
];

let shuttingDown = false;

const children = services.map((service) => {
  const child = spawn(npmCommand, service.args, {
    cwd: service.cwd,
    shell: process.platform === "win32",
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  });

  child.stdout.on("data", (data) => {
    process.stdout.write(prefix(service.name, data));
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(prefix(service.name, data));
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code}`;
    console.error(`[${service.name}] exited with ${reason}`);
    shutdown(code || 1);
  });

  child.on("error", (error) => {
    if (shuttingDown) return;
    console.error(`[${service.name}] failed to start: ${error.message}`);
    shutdown(1);
  });

  return child;
});

function prefix(name, data) {
  return data
    .toString()
    .split(/\r?\n/)
    .map((line, index, lines) => {
      if (line === "" && index === lines.length - 1) return "";
      return `[${name}] ${line}`;
    })
    .join("\n");
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) child.kill();
  }

  setTimeout(() => process.exit(code), 200);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
