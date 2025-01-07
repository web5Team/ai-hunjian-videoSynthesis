import { expect } from "chai";
import {
    Video,
    Lens,
    validateData,
    generateSegmentsForVideo,
    generateAllSegments,
    cartesianProduct,
    generateAllMicroSequences,
    validateMicroSequences,
    generateVideoSequences,
    MicroSequence,
} from "../src/videoSynthesis";

describe("视频合成服务单元测试", () => {
    // 测试数据有效性检查
    describe("validateData", () => {
        it("应过滤掉时长小于2秒的视频", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 1 }, // 时长小于2秒
                        { id: "video_2", path: "video_2.mp4", duration: 3 }, // 有效视频
                    ],
                },
            ];
            const result = validateData(data);
            expect(result[0].videos.length).to.equal(1);
            expect(result[0].videos[0].id).to.equal("video_2");
        });

        it("应过滤掉非MP4格式的视频", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.avi", duration: 3 }, // 非MP4格式
                        { id: "video_2", path: "video_2.mp4", duration: 3 }, // 有效视频
                    ],
                },
            ];
            const result = validateData(data);
            expect(result[0].videos.length).to.equal(1);
            expect(result[0].videos[0].id).to.equal("video_2");
        });

        it("应跳过没有有效视频的镜头", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.avi", duration: 1 }, // 无效视频
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 3 }, // 有效视频
                    ],
                },
            ];
            const result = validateData(data);
            expect(result.length).to.equal(1);
            expect(result[0].lens).to.equal(2);
        });
    });

    // 测试生成视频片段
    describe("generateSegmentsForVideo", () => {
        it("应为5秒视频生成2个片段", () => {
            const video: Video = { id: "video_1", path: "video_1.mp4", duration: 5 };
            const segments = generateSegmentsForVideo(video, 1);
            expect(segments.length).to.equal(2);
            expect(segments[0].choose_time).to.deep.equal({
                start: 0,
                end: 2
            });
            expect(segments[1].choose_time).to.deep.equal({
                start: 2,
                end: 4
            });
        });

        it("应为6秒视频生成3个片段", () => {
            const video: Video = { id: "video_1", path: "video_1.mp4", duration: 6 };
            const segments = generateSegmentsForVideo(video, 1);
            expect(segments.length).to.equal(3);
            expect(segments[2].choose_time).to.deep.eq({
                start: 4,
                end: 6,
            });
        });

        it("应跳过结束时间超过视频时长的片段", () => {
            const video: Video = { id: "video_1", path: "video_1.mp4", duration: 3 };
            const segments = generateSegmentsForVideo(video, 1);
            expect(segments.length).to.equal(1);
            expect(segments[0].choose_time).to.deep.equal({
                start: 0,
                end: 2,
            });
        });
    });

    // 测试生成所有片段的组合
    describe("generateAllSegments", () => {
        it("应为每个镜头生成所有片段的列表", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 4 }, // 2个片段
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 6 }, // 3个片段
                    ],
                },
            ];
            const result = generateAllSegments(data);
            expect(result.length).to.equal(2);
            expect(result[0].length).to.equal(2); // 镜头1的片段数量
            expect(result[1].length).to.equal(3); // 镜头2的片段数量
        });
    });

    // 测试笛卡尔积
    describe("cartesianProduct", () => {
        it("应生成所有可能的组合（数字数组）", () => {
            const arrays = [
                [1, 2], // number[]
                [3, 4], // number[]
            ];
            const result = cartesianProduct(arrays);
            expect(result.length).to.equal(4);
            expect(result).to.deep.equal([
                [1, 3],
                [1, 4],
                [2, 3],
                [2, 4],
            ]);
        });

        it("应生成所有可能的组合（字符串数组）", () => {
            const arrays = [
                ["a", "b"], // string[]
                ["c", "d"], // string[]
            ];
            const result = cartesianProduct(arrays);
            expect(result.length).to.equal(4);
            expect(result).to.deep.equal([
                ["a", "c"],
                ["a", "d"],
                ["b", "c"],
                ["b", "d"],
            ]);
        });
    });

    // 测试生成所有微序列
    describe("generateAllMicroSequences", () => {
        it("应生成所有可能的微序列", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 4 }, // 2个片段
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 6 }, // 3个片段
                    ],
                },
            ];
            const result = generateAllMicroSequences(data, 10); // 目标数量为10
            expect(result.length).to.equal(6); // 2 * 3 = 6
        });

        it("应在没有有效片段时返回空数组", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 1 }, // 无效视频
                    ],
                },
            ];
            const result = generateAllMicroSequences(data, 10); // 目标数量为10
            expect(result.length).to.equal(0);
        });

        it("应返回不超过目标数量的微序列", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 4 }, // 2个片段
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 6 }, // 3个片段
                    ],
                },
            ];
            const result = generateAllMicroSequences(data, 3); // 目标数量为3
            expect(result.length).to.equal(3); // 返回前3个微序列
        });
    });

    // 测试微序列合法性检查
    describe("validateMicroSequences", () => {
        it("应过滤掉结束时间超过视频时长的片段", () => {
            const sequences: MicroSequence[] = [
                [
                    {
                        lens: 1,
                        id: "video_1",
                        path: "video_1.mp4",
                        duration: 4,
                        choose_time: {
                            start: 0,
                            end: 5,
                        },
                        video_name: "lens_1_video_1.mp4",
                    },
                ],
            ];
            const result = validateMicroSequences(sequences);
            expect(result.length).to.equal(0);
        });

        it("应保留合法的微序列", () => {
            const sequences: MicroSequence[] = [
                [
                    {
                        lens: 1,
                        id: "video_1",
                        path: "video_1.mp4",
                        duration: 4,
                        choose_time: {
                            start: 0,
                            end: 2,
                        },
                        video_name: "lens_1_video_1.mp4",
                    },
                ],
            ];
            const result = validateMicroSequences(sequences);
            expect(result.length).to.equal(1);
        });
    });

    // 测试主函数
    describe("generateVideoSequences", () => {
        it("应在没有有效镜头数据时返回空数组", () => {
            const data: Lens[] = [];
            const result = generateVideoSequences(data, 10); // 目标数量为10
            expect(result.length).to.equal(0);
        });

        it("应生成所有合法的微序列", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 4 }, // 2个片段
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 6 }, // 3个片段
                    ],
                },
            ];
            const result = generateVideoSequences(data, 10); // 目标数量为10
            expect(result.length).to.equal(6); // 2 * 3 = 6
        });

        it("应返回不超过目标数量的微序列", () => {
            const data: Lens[] = [
                {
                    lens: 1,
                    duration: 2,
                    videos: [
                        { id: "video_1", path: "video_1.mp4", duration: 4 }, // 2个片段
                    ],
                },
                {
                    lens: 2,
                    duration: 2,
                    videos: [
                        { id: "video_2", path: "video_2.mp4", duration: 6 }, // 3个片段
                    ],
                },
            ];
            const result = generateVideoSequences(data, 3); // 目标数量为3
            expect(result.length).to.equal(3); // 返回前3个微序列
        });
    });
});
