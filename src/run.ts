// run.ts
import { generateVideoSequences, Lens } from "./videoSynthesis";

// 初始化数据
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

// 目标生成数量
const targetCount = 5; // 生成5个合法的微序列

// 调用主函数
const result = generateVideoSequences(initialData, targetCount);

// 输出结果
console.log(JSON.stringify(result, null, 2));