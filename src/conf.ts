// Allows other Lua modules to be added as dependencies and used.
//
// Use `yarn add <username>/<github repo name>` to install a Lua module.
//
// package.path may have to be modified to link to certain modules correctly.
/* eslint-disable @typescript-eslint/ban-ts-ignore */

import { GAME_SCALE } from "./models";

// @ts-ignore: package is a reserved word in TS but a builtin in Lua
package.path += ";node_modules/?/init.lua";
// @ts-ignore: package is a reserved word in TS but a builtin in Lua
package.path += ";node_modules/?/?.lua";
/* eslint-enable */

love.conf = (t) => {
  t.window.title = "Heat Death";
  t.window.width = GAME_SCALE * 640;
  t.window.height = GAME_SCALE * 352;
};
