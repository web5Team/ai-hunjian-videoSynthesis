// src/videoSynthesis.ts

// 定义类型
export type Video = {
    id: string;
    path: string;
    duration: number;
};

export type Lens = {
    lens: number;
    duration: number;
    videos: Video[];
};

export type MicroSegment = {
    lens: number;
    id: string;
    path: string;
    duration: number;
    choose_time: string;
    video_name: string;
};

export type MicroSequence = MicroSegment[];

// 检查视频文件是否为合法 MP4 格式
export function is_valid_mp4(path: string): boolean {
    return path.endsWith(".mp4");
}

// 数据有效性检查
export function validateData(data: Lens[]): Lens[] {
    const validLenses: Lens[] = [];
    for (const lens of data) {
        const validVideos: Video[] = [];
        for (const video of lens.videos) {
            if (video.duration < 2) {
                console.warn(`警告：视频 ${video.id} 时长小于2秒，已删除`);
                continue;
            }
            if (!is_valid_mp4(video.path)) {
                console.warn(`警告：视频 ${video.id} 文件不合法，已删除`);
                continue;
            }
            validVideos.push(video);
        }
        if (validVideos.length > 0) {
            lens.videos = validVideos;
            validLenses.push(lens);
        }
    }
    return validLenses;
}

// 生成一个视频的所有2秒片段
export function generateSegmentsForVideo(video: Video, lensId: number): MicroSegment[] {
    const segments: MicroSegment[] = [];
    for (let startTime = 0; startTime <= video.duration - 2; startTime += 2) {
        const endTime = startTime + 2;
        if (endTime > video.duration) {
            console.warn(`警告：视频 ${video.id} 的结束时间 ${endTime} 超过视频时长，已跳过`);
            continue;
        }
        segments.push({
            lens: lensId,
            id: video.id,
            path: video.path,
            duration: video.duration,
            choose_time: `${String(startTime).padStart(3, "0")}-${String(endTime).padStart(3, "0")}`,
            video_name: `lens_${lensId}_video_${video.id}.mp4`,
        });
    }
    return segments;
}

// 生成所有镜头的片段列表
export function generateAllSegments(lensData: Lens[]): MicroSegment[][] {
    return lensData.map((lens) => {
        const segments: MicroSegment[] = [];
        for (const video of lens.videos) {
            segments.push(...generateSegmentsForVideo(video, lens.lens));
        }
        return segments;
    });
}

// 计算笛卡尔积
export function cartesianProduct<T>(arrays: T[][]): T[][] {
    return arrays.reduce<T[][]>(
        (acc, current) => {
            return acc.flatMap((x) => current.map((y) => [...x, y]));
        },
        [[]]
    );
}

// 生成所有可能的微序列
export function generateAllMicroSequences(lensData: Lens[]): MicroSequence[] {
    const allSegments = generateAllSegments(lensData);
    if (allSegments.length === 0) {
        console.warn("警告：没有有效的片段数据");
        return [];
    }
    return cartesianProduct(allSegments);
}

// 检查微序列合法性
export function validateMicroSequences(microSequences: MicroSequence[]): MicroSequence[] {
    const validSequences: MicroSequence[] = [];
    for (const sequence of microSequences) {
        let isValid = true;
        for (const segment of sequence) {
            const [start, end] = segment.choose_time.split("-").map(Number);
            if (end > segment.duration) {
                console.warn(`警告：视频 ${segment.video_name} 的结束时间 ${end} 超过视频时长，已删除`);
                isValid = false;
                break;
            }
        }
        if (isValid) {
            validSequences.push(sequence);
        }
    }
    return validSequences;
}

// 主函数
export function generateVideoSequences(initialData: Lens[]): MicroSequence[] {
    // 1. 数据有效性检查
    const validLenses = validateData(initialData);
    if (validLenses.length === 0) {
        console.warn("警告：没有有效的镜头数据");
        return [];
    }

    // 2. 生成所有可能的微序列
    const allMicroSequences = generateAllMicroSequences(validLenses);

    // 3. 检查微序列合法性
    const validSequences = validateMicroSequences(allMicroSequences);

    return validSequences;
}