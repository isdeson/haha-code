type ImageSource = string | File | HTMLImageElement

/**
 * 图片转 base64（支持网络 / 本地 / File）
 */
export const imageToBase64 = (source: ImageSource): Promise<string> =>
  new Promise((resolve, reject) => {
    // 1️⃣ File（本地上传）
    if (source instanceof File) {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(source)
      return
    }

    // 2️⃣ HTMLImageElement
    if (source instanceof HTMLImageElement) {
      return drawImageToBase64(source, resolve, reject)
    }

    // 3️⃣ string（网络 / 本地资源路径）
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = source

    img.onload = () => drawImageToBase64(img, resolve, reject)
    img.onerror = reject
  })

/** canvas 绘制通用逻辑 */
const drawImageToBase64 = (
  img: HTMLImageElement,
  resolve: (val: string) => void,
  reject: (err?: unknown) => void,
) => {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) return reject('Canvas not supported')

    ctx.drawImage(img, 0, 0)
    resolve(canvas.toDataURL('image/png'))
  } catch (err) {
    reject(err)
  }
}

// ✅ 1️⃣ 项目内 import 的图片（最常见）
// import logo from '@/assets/logo.png'
// const base64 = await imageToBase64(logo)

// ✅ 2️⃣ public 目录图片
// await imageToBase64('/logo.png')

// ✅ 3️⃣ 用户上传的图片
// <input
//   type="file"
//   accept="image/*"
//   onChange={async (e) => {
//     const file = e.target.files?.[0]
//     if (!file) return

//     const base64 = await imageToBase64(file)
//     console.log(base64)
//   }}
// />

// ✅ 4️⃣ 已存在的 <img />
// const imgEl = document.querySelector('img')!
// const base64 = await imageToBase64(imgEl)
