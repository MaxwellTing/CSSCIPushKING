import { NextRequest, NextResponse } from 'next/server';

// GitHub API 配置
const GITHUB_API = 'https://api.github.com';

interface SyncData {
  tasks: any[];
  studySessions: any[];
  literatureRecords: any[];
  wordCount: number;
  countdownDate: string;
  countdownLabel: string;
  waterGlasses: boolean[];
  fitnessActivities: any[];
  inspirationNotes: any[];
  pomodoroTarget: number;
}

// 获取文件的 SHA（如果存在）
async function getFileSha(token: string, owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 同步数据到 GitHub
async function syncToGitHub(
  token: string, 
  owner: string, 
  repo: string, 
  data: SyncData
): Promise<{ success: boolean; message: string; commitSha?: string }> {
  const path = 'data.json';
  const content = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');
  
  // 获取现有文件的 SHA
  const sha = await getFileSha(token, owner, repo, path);
  
  const body: any = {
    message: `📊 Update Research & Life OS data - ${new Date().toLocaleString('zh-CN')}`,
    content,
    branch: 'main',
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (response.ok) {
      const result = await response.json();
      return { 
        success: true, 
        message: '同步成功！',
        commitSha: result.commit.sha 
      };
    } else {
      const error = await response.json();
      return { 
        success: false, 
        message: error.message || '同步失败' 
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || '网络错误' 
    };
  }
}

// 从 GitHub 加载数据
async function loadFromGitHub(
  token: string,
  owner: string,
  repo: string
): Promise<{ success: boolean; data?: SyncData; message: string }> {
  const path = 'data.json';
  
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
      return { 
        success: true, 
        data: content,
        message: '加载成功' 
      };
    } else {
      return { 
        success: false, 
        message: '文件不存在或无法访问' 
      };
    }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || '网络错误' 
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, token, repo, data } = body;
    
    if (!token || !repo) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    const [owner, repoName] = repo.split('/');
    
    if (!owner || !repoName) {
      return NextResponse.json(
        { success: false, message: '仓库地址格式错误，应为 owner/repo' },
        { status: 400 }
      );
    }
    
    if (action === 'sync') {
      const result = await syncToGitHub(token, owner, repoName, data);
      return NextResponse.json(result);
    } else if (action === 'load') {
      const result = await loadFromGitHub(token, owner, repoName);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { success: false, message: '未知操作' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || '服务器错误' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Research & Life OS Sync API',
    endpoints: {
      sync: 'POST /api/sync { action: "sync", token, repo, data }',
      load: 'POST /api/sync { action: "load", token, repo }'
    }
  });
}
