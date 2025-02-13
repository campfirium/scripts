-- Based on sub-pause.lua by Ben Kerman (© 2022)
-- AI-enhanced modifications by Campfirium (https://campfirium.info/)

local cfg = {
    default_start = false,
    default_end = false,
    end_delta = 0.1,
    hide_while_playing = false,
    unpause_time = 0,
    unpause_override = "SPACE",
    replay_prev = true,
    -- 字幕文本长度阈值（字符数）
    min_chars = 10
}

require("mp.options").read_options(cfg)

local active = false
local pause_at_start = cfg.default_start
local pause_at_end = cfg.default_end
local skip_next = false
local pause_at = 0

function set_visibility(state)
    mp.set_property_bool("sub-visibility", state)
    mp.osd_message(" ", 0.001) -- 强制刷新字幕
end

function handle_pause(_, paused)
    if cfg.hide_while_playing and not paused then
        set_visibility(false)
        mp.unobserve_property(handle_pause)
    end
end

function pause()
    if skip_next then
        skip_next = false
    else
        mp.set_property_bool("pause", true)
        if cfg.hide_while_playing then
            set_visibility(true)
        end
        if cfg.unpause_time > 0 then
            local timer = mp.add_timeout(cfg.unpause_time, function()
                mp.set_property_bool("pause", false)
                mp.remove_key_binding("unpause-override")
            end)
            mp.add_forced_key_binding(cfg.unpause_override, "unpause-override", function()
                timer:kill()
                mp.remove_key_binding("unpause-override")
            end)
        end
        mp.observe_property("pause", "bool", handle_pause)
    end
end

function handle_tick(_, time_pos)
    if time_pos ~= nil and pause_at - time_pos < cfg.end_delta then
        if pause_at_end then pause() end
        mp.unobserve_property(handle_tick)
    end
end

-- 计算实际字符数（支持UTF-8）
local function utf8_len(str)
    local len = 0
    for _ in str:gmatch("[%z\1-\127\194-\244][\128-\191]*") do
        len = len + 1
    end
    return len
end

function handle_sub_change(_, sub_end)
    if mp.get_property_number('sid', -1) == -1 then
        return
    end

    local sub_text = mp.get_property("sub-text")
    if not sub_text or sub_text == "" then
        return
    end

    -- 如果字幕包含任一音乐符号，则跳过暂停
    if sub_text:find("♪") or sub_text:find("♫") or sub_text:find("♬") then
        return
    end

    -- 预处理文本：先去除全角和半角括号内的内容，再去除标点和空白字符
    local processed_text = sub_text:gsub("（.-）", "")    -- 去除全角括号及其中内容
    processed_text = processed_text:gsub("%b()", "")       -- 去除半角括号及其中内容

    if processed_text == "" then  -- 如果去除括号后为空，直接返回
        return
    end

    processed_text = processed_text:gsub("[%p%s]", "")     -- 去除所有标点符号和空白字符

    -- 打印处理过程（调试用，之后可删除）
    mp.msg.info("Original text: " .. sub_text)
    mp.msg.info("After bracket removal: " .. processed_text)
    mp.msg.info("Length: " .. utf8_len(processed_text))

    -- 使用处理后的文本判断字符数
    if utf8_len(processed_text) < cfg.min_chars then
        return
    end

    local sub_start = mp.get_property_number("sub-start")
    if sub_start ~= nil and sub_end ~= nil then
        mp.unobserve_property(handle_tick)
        if pause_at_start then
            pause()
        end
        pause_at = sub_end + mp.get_property_number("sub-delay")
        mp.observe_property("time-pos", "number", handle_tick)
    end
end

function replay_sub()
    if pause_at_start then skip_next = true end

    local sub_start = mp.get_property_number("sub-start")
    if sub_start ~= nil then
        mp.set_property_number("time-pos", sub_start + mp.get_property_number("sub-delay"))
        mp.set_property_bool("pause", false)
    elseif cfg.replay_prev then
        mp.command("no-osd sub-seek -1")
        mp.set_property_bool("pause", false)
    end
end

function display_state()
    local msg
    if active then
        msg = "Subtitle pausing enabled (" 
            .. (pause_at_start and "start" or "")
            .. ((pause_at_start and pause_at_end) and " and " or "")
            .. (pause_at_end and "end" or "") .. ")"
    else 
        msg = "Subtitle pausing disabled" 
    end
    mp.osd_message(msg)
end

local saved_visibility = true

function toggle()
    if active then
        if not pause_at_start and not pause_at_end then
            pause_at = 0
            skip_next = false
            mp.unobserve_property(handle_sub_change)
            mp.unobserve_property(handle_tick)
            active = false
            if cfg.hide_while_playing then
                set_visibility(saved_visibility)
            end
            mp.unobserve_property(handle_pause)
        end
    else
        if cfg.hide_while_playing then
            saved_visibility = mp.get_property_bool("sub-visibility")
            set_visibility(false)
        end
        mp.observe_property("sub-end", "number", handle_sub_change)
        active = true
    end
    display_state()
end

mp.add_key_binding(nil, "toggle-start", function()
    pause_at_start = not pause_at_start
    toggle()
end)

mp.add_key_binding("n", "toggle-end", function()
    pause_at_end = not pause_at_end
    toggle()
end)

mp.add_key_binding("Alt+r", "skip-next", function() skip_next = true end)

mp.add_key_binding("Ctrl+r", "replay", function() replay_sub() end)

if pause_at_start or pause_at_end then
    toggle()
end
