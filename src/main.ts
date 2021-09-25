if (os.getenv("LOCAL_LUA_DEBUGGER_VSCODE") === "1") {
  require("@NoResolution:lldebugger").start();
}

let content = "";

love.load = () => {
  [content] = love.filesystem.read("res/index.txt");
  print(content);
};

love.draw = () => {
  love.graphics.print("Hello World!", 400, 300);
};
