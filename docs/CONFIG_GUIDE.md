# RCV Website Configuration Guide

## 配置文件说明

网站使用 `config.toml` 文件进行配置管理。以下是各个配置选项的说明：

## 主页轮播图配置 (Hero Section)

在 `config.toml` 文件的 `[hero]` 部分，您可以配置主页轮播图：

### 轮播图片设置

```toml
[hero.slides]
slides = [
  { image = "home_1.jpg", alt = "图片描述" },
  { image = "home_2.jpg", alt = "图片描述" },
  # 添加更多图片...
]
```

**可用的图片文件：**
- `home_1.jpg` 到 `home_15.jpg` 
- `home_1.png` 到 `home_15.png`
- `EngineeringBuilding_VT&R.png`

### 轮播设置

```toml
auto_play = true              # 是否自动播放
slide_duration = 5000         # 每张图片显示时间（毫秒）
show_navigation = true        # 是否显示左右导航按钮
show_indicators = true        # 是否显示底部指示点
```

## 如何修改轮播图

1. **添加新图片：** 将图片放入 `public/assets/media/home_slides/` 文件夹，并在代码中使用 `getAssetUrl('media/home_slides/文件名')` 引用，确保兼容 `base` 路径。
2. **修改轮播列表：** 编辑 `config.toml` 中的 `slides` 数组
3. **调整设置：** 修改自动播放、显示时间等参数

## 示例配置

```toml
[hero]
slides = [
  { image = "home_1.jpg", alt = "实验室主要设施" },
  { image = "home_2.jpg", alt = "研究环境" },
  { image = "home_3.jpg", alt = "先进设备" },
  { image = "EngineeringBuilding_VT&R.png", alt = "工程大楼" },
]

auto_play = true
slide_duration = 4000
show_navigation = true
show_indicators = true
```

## 其他配置选项

### 网站基本信息
```toml
[site]
title = "机器人与计算机视觉实验室"
subtitle = "RCV Lab"
description = "实验室描述..."
```

### 联系信息
```toml
[contact]
email = "contact@rcvlab.org"
phone = "+1 (555) 123-4567"
address = "123 University Ave, Research Building"
```

### 社交媒体链接
```toml
[social]
github = "https://github.com/rcvlab"
linkedin = "https://linkedin.com/company/rcvlab"
```

## 注意事项

1. 目前配置文件主要用于文档和未来扩展
2. 当前实际配置在 `src/utils/config.ts` 文件中
3. 未来可以扩展为真正的TOML文件读取功能
