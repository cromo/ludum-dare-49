if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

let content = "";

love.load = () => {
  const [rawContent] = love.filesystem.read("res/index.txt");
  if (rawContent !== undefined) {
    content = rawContent;
  }
  print(content);
};

love.draw = () => {
  love.graphics.print("Hello World!", 400, 300);
  love.graphics.line(1, 1, 40, 70, 70, 20);
};
