export async function onRequestPost(context) {
  const { request, env } = context;

  const token = env.GITHUB_TOKEN; // simpan di Cloudflare Pages Secrets
  const repoOwner = env.REPO_OWNER || "codepiawai";
  const repoName = env.REPO_NAME || "files";
  const pathInRepo = env.REPO_PATH || "uploads/";

  // Baca form-data
  const formData = await request.formData();
  const file = formData.get("image");

  if (!file || typeof file === "string") {
    return new Response("Gagal menerima file.", { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64Content = btoa(
    String.fromCharCode(...new Uint8Array(arrayBuffer))
  );

  const now = new Date();
  const dateString = now.toISOString().replace(/[:.]/g, "-");
  const finalPath = `${pathInRepo}${dateString}_${file.name}`;

  const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${finalPath}`;

  const body = JSON.stringify({
    message: "Upload image via API",
    content: base64Content
  });

  const response = await fetch(githubApiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "CF-Worker"
    },
    body
  });

  const result = await response.json();

  if (response.status === 201) {
    return new Response("Berhasil diunggah ke GitHub.");
  } else {
    return new Response(`Gagal mengunggah ke GitHub. Kode: ${response.status}\n${JSON.stringify(result)}`, {
      status: response.status
    });
  }
}
