

# **AI视频矩阵合成服务**

## **项目概述**
本项目是一个AI视频矩阵合成服务，旨在从多个镜头的视频中抽取2秒片段，并生成所有可能的微序列组合。每个镜头的视频片段会与其他镜头的片段平等组合，确保穷举所有可能的组合，来保证最后所合成的视频不重复。这样AI混剪除了的视频矩阵便于自媒体玩家降低视频创作门槛，减少平台判重，对代码有问题可以联系邮件或者issue。

---

## **环境依赖**
- **Node.js**: 建议使用最新稳定版（>= 16.x）。
- **TypeScript**: 项目使用 TypeScript 编写，需要安装 TypeScript 编译器。
- **Mocha**: 用于运行单元测试。
- **Chai**: 用于断言测试结果。

---

## **环境初始化**
### **1. 克隆项目**
```bash
git clone <项目仓库地址>
cd <项目文件夹>
```

### **2. 安装依赖**
```bash
npm install
```

### **3. 安装 TypeScript 和测试工具**
```bash
npm install typescript mocha chai @types/mocha @types/chai ts-node --save-dev
```

---

## **如何运行代码**
### **1. 直接运行 TypeScript 代码（无需编译）**
如果你只是想快速验证代码，可以使用 `ts-node` 直接运行 TypeScript 文件。

#### **运行主函数**
创建一个 `run.ts` 文件，内容如下：

```typescript
// run.ts
import { generateVideoSequences, Lens } from "./src/videoSynthesis";

const initialData: Lens[] = [
    {
        lens: 1,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 5 }, // 5秒视频，生成2个片段
            { id: "video_2", path: "video_2.mp4", duration: 6 }, // 6秒视频，生成3个片段
        ],
    },
    {
        lens: 2,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 4 }, // 4秒视频，生成2个片段
            { id: "video_2", path: "video_2.mp4", duration: 3 }, // 3秒视频，生成1个片段
        ],
    },
];

const result = generateVideoSequences(initialData);
console.log(JSON.stringify(result, null, 2));
```

运行代码：
```bash
npx ts-node run.ts
```

#### **运行单元测试**
```bash
npm test
```

### **2. 编译 TypeScript 代码（可选）**
如果你想将 TypeScript 代码编译为 JavaScript 后再运行，可以按照以下步骤操作：

1. 编译 TypeScript 代码：
   ```bash
   tsc
   ```

2. 运行编译后的 JavaScript 代码：
   ```bash
   node dist/run.js
   ```

---

## **项目需求**
### **1. 输入数据**
- 每个镜头包含多个视频片段。
- 每个视频片段有路径、时长等信息。
- 视频时长可能为奇数或偶数。

### **2. 输出数据**
- 从每个镜头的视频中抽取2秒片段。
- 生成所有可能的微序列组合，确保每个镜头的片段平等组合。

### **3. 边界情况**
- 视频时长小于2秒。
- 视频文件格式不合法（非MP4格式）。
- 视频时长为奇数，导致最后一个片段超出时长。
- 镜头数量为0或视频数量为0。

---

## **总体设计思路**
### **1. 数据有效性检查**
- 过滤掉时长小于2秒的视频。
- 过滤掉非MP4格式的视频。

### **2. 生成视频片段**
- 从每个视频中生成所有可能的2秒片段。
- 确保片段结束时间不超过视频时长。

### **3. 生成微序列**
- 使用笛卡尔积生成所有可能的微序列组合。
- 确保每个镜头的片段平等组合。

### **4. 合法性检查**
- 检查每个微序列中的片段是否合法。

---

## **代码讲解 (`src/videoSynthesis.ts`)**

### **1. 类型定义**
- `Video`: 表示视频片段，包含 `id`、`path`、`duration`。
- `Lens`: 表示镜头，包含 `lens`（镜头ID）、`duration`（镜头时长）、`videos`（视频列表）。
- `MicroSegment`: 表示2秒片段，包含 `lens`、`id`、`path`、`duration`、`choose_time`、`video_name`。
- `MicroSequence`: 表示微序列，是 `MicroSegment` 的数组。

### **2. 核心函数**
- `validateData`: 过滤无效视频。
- `generateSegmentsForVideo`: 生成视频的所有2秒片段。
- `generateAllSegments`: 生成所有镜头的片段列表。
- `cartesianProduct`: 计算笛卡尔积，生成所有可能的微序列组合。
- `validateMicroSequences`: 检查微序列的合法性。
- `generateVideoSequences`: 主函数，生成所有合法的微序列。

---

## **单元测试讲解 (`test/videoSynthesis.test.ts`)**

### **1. 测试数据有效性检查**
- 测试过滤掉时长小于2秒的视频。
- 测试过滤掉非MP4格式的视频。
- 测试跳过没有有效视频的镜头。

### **2. 测试生成视频片段**
- 测试为5秒视频生成2个片段。
- 测试为6秒视频生成3个片段。
- 测试跳过结束时间超过视频时长的片段。

### **3. 测试生成所有片段的组合**
- 测试为每个镜头生成所有片段的列表。

### **4. 测试笛卡尔积**
- 测试生成所有可能的组合（数字数组和字符串数组）。

### **5. 测试生成所有微序列**
- 测试生成所有可能的微序列。
- 测试在没有有效片段时返回空数组。

### **6. 测试微序列合法性检查**
- 测试过滤掉结束时间超过视频时长的片段。
- 测试保留合法的微序列。

### **7. 测试主函数**
- 测试在没有有效镜头数据时返回空数组。
- 测试生成所有合法的微序列。

---

## **测试数据**
以下是一个测试数据的示例：

```typescript
const initialData: Lens[] = [
    {
        lens: 1,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 5 }, // 5秒视频，生成2个片段
            { id: "video_2", path: "video_2.mp4", duration: 6 }, // 6秒视频，生成3个片段
        ],
    },
    {
        lens: 2,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 4 }, // 4秒视频，生成2个片段
            { id: "video_2", path: "video_2.mp4", duration: 3 }, // 3秒视频，生成1个片段
        ],
    },
];
```

---

## **使用说明**
### **1. 导入模块**
```typescript
import { generateVideoSequences, Lens } from "./src/videoSynthesis";
```

### **2. 准备输入数据**
```typescript
const initialData: Lens[] = [
    {
        lens: 1,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 5 },
            { id: "video_2", path: "video_2.mp4", duration: 6 },
        ],
    },
    {
        lens: 2,
        duration: 2,
        videos: [
            { id: "video_1", path: "video_1.mp4", duration: 4 },
            { id: "video_2", path: "video_2.mp4", duration: 3 },
        ],
    },
];
```

### **3. 生成微序列**
```typescript
const result = generateVideoSequences(initialData);
console.log(JSON.stringify(result, null, 2));
```

### **4. 运行测试**
```bash
npm test
```

---

## **如何使用和集成**
1. 克隆项目并安装依赖。
2. 根据需求修改 `initialData` 数据。
3. 调用 `generateVideoSequences` 函数生成微序列。
4. 运行单元测试，确保代码功能正确。

---

## **联系方式**
如有问题，请联系项目负责人：  
- 邮箱：zxy@demohub.top  
- GitHub: [web5Team](https://github.com/web5Team)
