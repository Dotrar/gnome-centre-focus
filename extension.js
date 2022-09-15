/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const overview = imports.ui.main.overview;

class Extension {
    constructor() {
        this._handler = null;
    }

    enable() {
        // when a new window is focused, move the mouse
        // we want a reference to `this` so we will pass
        // a closure
        this._handler = global.display.connect(
            'notify::focus-window', 
            ()=>{this._moveMouse()}
        );
        
        this._seat = Clutter
            .get_default_backend()
            .get_default_seat();
    }

    disable() {
        global.display.disconnect(this._handler);
        this._seat = null;
    }
    
    _moveMouse(){
        if (!overview.visible) {
            // get currently focused window 
            const win = global.display.focus_window;
            if (this._seat == null || win == null){
                return;
            }
            const win_rect = win.get_frame_rect();
            const [x, y] = global.get_pointer();

            //check if the cursor is already in the window 
            const pointer_rect = new Meta.Rectangle({ x, y, width: 1, height: 1 });
            if (pointer_rect.intersect(win_rect)[0]){
                return;
            }
            
            //move to new position
            const nx = win_rect.x + win_rect.width / 2;
            const ny = win_rect.y + win_rect.height / 2;
            this._seat.warp_pointer(nx, ny);
        }

    }

}

function init() {
    return new Extension();
}
