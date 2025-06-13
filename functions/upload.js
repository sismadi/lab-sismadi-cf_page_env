export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    const file = formData.get("image");
    const content = await file.arrayBuffer();
    const base64Content = btoa(String.fromCharCode(...new Uint8Array(content)));

    const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}_${file.name}`;
    const url = `https://api.github.com/repos/${context.env.REPO_OWNER}/${context.env.REPO_NAME}/contents/${context.env.REPO_PATH}${filename}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${context.env.GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "CloudflarePagesUploader"
      },
      body: JSON.stringify({
        message: "Upload via Cloudflare Pages",
        content: base64Content
      })
    });

    const result = await response.json();
    if (response.status === 201) {
      return new Response("Berhasil diunggah ke GitHub!", { status: 201 });
    } else {
      return new Response("Gagal: " + JSON.stringify(result), { status: 500 });
    }
  } catch (err) {
    return new Response("Error: " + err.message, { status: 500 });
  }
}
