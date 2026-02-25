import fs from 'fs';

async function test() {
  const fileContent = new Blob(['Hello World!'], { type: 'text/plain' });
  const formData = new FormData();
  formData.append('file', fileContent, 'test.txt');
  formData.append('filePath', 'documents/test_proxy.txt');

  try {
    const res = await fetch('http://localhost:8080/api/upload', {
      method: 'POST',
      body: formData,
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}
test();
