# **mpv-sub-pause.lua**  
**An AI-enhanced subtitle pausing script for MPV**  
**基于 AI 改进的 MPV 字幕暂停脚本**  

---

## 📌 **Introduction | 介绍**  
This script is an enhanced version of [`sub-pause.lua`](https://github.com/BenKerman/sub-pause) by **Ben Kerman (© 2022)**.  
本脚本基于 [`sub-pause.lua`](https://github.com/BenKerman/sub-pause)（作者：**Ben Kerman (© 2022)**）进行优化。  

The modifications were primarily AI-generated to improve subtitle pausing accuracy.  
**主要由 AI 生成修改，以提升字幕暂停的准确性**。  

While the script has been optimized, **some issues may not be fixable** due to the nature of AI-generated modifications.  
尽管脚本已优化，但**某些问题可能无法解决**，因为修改主要由 AI 生成。  

---

## 🛠 **Enhanced Subtitle Handling | 优化字幕处理**  
Skips pausing on **irrelevant subtitles**, including those with **music symbols** (♪ ♫ ♬).  
跳过**无关字幕**，包括带有 **音乐符号**（♪ ♫ ♬）的字幕。  

Skips subtitles with **insufficient content** after removing bracketed text (default: fewer than 10 characters, configurable).  
跳过**实际内容过短的字幕**（去除括号文本后少于 10 个字符，可自定义）。  


---

## 📌 **Installation | 安装**  
1. **Download** `mpv-sub-pause.lua`.  
1. **下载** `mpv-sub-pause.lua`。  

2. Place it in your MPV `scripts` directory:  
2. 将其放入 MPV **脚本目录**：  

   ```
   ~/.config/mpv/scripts/  (Linux/macOS)  
   %APPDATA%\mpv\scripts\  (Windows)  
   ```
   ```
   ~/.config/mpv/scripts/  （Linux/macOS）  
   %APPDATA%\mpv\scripts\  （Windows）  
   ```

3. Restart MPV.  
3. **重启 MPV**。  

4. Press `n` to enable subtitle pausing.  
4. **按 `n` 键开启字幕暂停**。  

---

## 📜 **Credits & License | 版权与许可**  
**Original script by | 原脚本作者：** [Ben Kerman (© 2022)](https://github.com/BenKerman/sub-pause)  
**AI-enhanced modifications by | AI 改进：** [Campfirium](https://campfirium.info/)  

This script follows the original terms: *Modification and redistribution are allowed as long as credit is given.*  
本脚本遵循原作者声明：**允许修改和再发布，但须注明原作者**。  

