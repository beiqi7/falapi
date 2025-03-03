'use client';

import { useState } from 'react';
import * as fal from '@fal-ai/serverless-client';

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyError, setApiKeyError] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setError('');
    }
  };

  const generateVideo = async () => {
    if (!image) {
      setError('请先上传图片');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 验证API密钥
      if (!apiKey.trim()) {
        setError('请输入 FAL.AI API 密钥');
        return;
      }

      // 配置fal.ai客户端
      fal.config({
        credentials: apiKey.trim()
      });

      // 将图片转换为base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(image);
      const base64Image = await base64Promise;

      // 调用fal.ai的API
      const result = await fal.subscribe('110602490-lcm-sd15-i2v', {
        input: {
          image_url: `data:image/jpeg;base64,${base64Image}`,
          num_frames: 50,
          num_inference_steps: 50
        },
        pollInterval: 5000,
        logs: true,
      });

      // 设置生成的视频URL
      if (result.video) {
        setVideoUrl(result.video);
      } else {
        throw new Error('视频生成失败');
      }

    } catch (err) {
      setError('生成视频时出错：' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="container max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center">图片转视频生成器</h1>
        
        <div className="space-y-4">
          <div className="space-y-4 mb-8">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setApiKeyError('');
              }}
              placeholder="请输入您的 FAL.AI API 密钥"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {apiKeyError && (
              <div className="text-red-500 text-sm">{apiKeyError}</div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-gray-300 hover:border-primary transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="imageUpload"
            />
            <label
              htmlFor="imageUpload"
              className="cursor-pointer text-center"
            >
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  alt="上传的图片"
                  className="max-h-64 object-contain"
                />
              ) : (
                <div className="text-gray-500">
                  点击或拖拽图片到这里上传
                </div>
              )}
            </label>
          </div>

          <button
            onClick={generateVideo}
            disabled={loading || !image}
            className={`w-full py-2 px-4 rounded-lg ${loading || !image ? 'bg-gray-300' : 'bg-primary text-white hover:bg-primary/80'} transition-colors`}
          >
            {loading ? '生成中...' : '生成视频'}
          </button>

          {error && (
            <div className="text-red-500 text-center">{error}</div>
          )}

          {videoUrl && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">生成的视频：</h2>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
