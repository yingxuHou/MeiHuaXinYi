// 在浏览器控制台中运行此代码来捕获完整的错误响应
// 在占卜失败后执行

(function captureLastResponse() {
  // 拦截XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this._method = method;
    this._url = url;
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(data) {
    const xhr = this;

    xhr.addEventListener('load', function() {
      if (xhr._url.includes('/divination/perform') && xhr.status === 400) {
        console.log('=== 占卜API完整错误响应 ===');
        console.log('URL:', xhr._url);
        console.log('Method:', xhr._method);
        console.log('Status:', xhr.status);
        console.log('Response:', xhr.responseText);

        // 尝试解析响应
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('解析后的响应:', response);

          // 保存到剪贴板（在新标签页中运行）
          if (navigator.clipboard) {
            navigator.clipboard.writeText(JSON.stringify(response, null, 2));
            console.log('响应已复制到剪贴板');
          }
        } catch (e) {
          console.error('解析响应失败:', e);
        }
      }
    });

    return originalXHRSend.apply(this, arguments);
  };

  console.log('响应捕获器已激活');
})();