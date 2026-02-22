const puppeteer = require('puppeteer')
const Product = require('../models/Product')

const CATEGORIAS = [
  { nombre: 'Procesadores AMD', cate: 27, scrapeSpecs: true },
  { nombre: 'Procesadores Intel', cate: 48, scrapeSpecs: true },
  { nombre: 'Combos', cate: 59, scrapeSpecs: false },
  { nombre: 'PC Escritorio', cate: 30, scrapeSpecs: false },
  { nombre: 'Notebooks', cate: 58, scrapeSpecs: false },
  { nombre: 'Mothers AMD', cate: 26, scrapeSpecs: true },
  { nombre: 'Mothers Intel', cate: 49, scrapeSpecs: true },
  { nombre: 'Placas de video Intel', cate: 116, scrapeSpecs: true },
  { nombre: 'Placas de video AMD', cate: 62, scrapeSpecs: true },
  { nombre: 'Placas de video NVIDIA', cate: 6, scrapeSpecs: true},
  { nombre: 'Memorias RAM', cate: 15, scrapeSpecs: true },
  { nombre: 'Memorias RAM Notebook', cate: 47, scrapeSpecs: false },
  { nombre: 'Discos externos', cate: 16, scrapeSpecs: true },
  { nombre: 'Discos rigidos', cate: 19, scrapeSpecs: true },
  { nombre: 'Discos SSD', cate: 81, scrapeSpecs: true },
  { nombre: 'Coolers Fan', cate: 35, scrapeSpecs: false },
  { nombre: 'Coolers CPU', cate: 36, scrapeSpecs: false },
  { nombre: 'Pasta termica', cate: 67, scrapeSpecs: false },
  { nombre: 'Gabinetes', cate: 7, scrapeSpecs: true },
  { nombre: 'Accesorios de Gabinetes', cate: 100, scrapeSpecs: false},
  { nombre: 'Fuentes de alimentacion', cate: 34, scrapeSpecs: true },
  { nombre: 'Monitores y pantallas', cate: 5, scrapeSpecs: false },
  { nombre: 'Sillas gamers', cate: 66, scrapeSpecs: false },
  { nombre: 'Robots', cate: 112, scrapeSpecs: false},
  { nombre: 'Placas de red inalambricas', cate: 14, scrapeSpecs: false },
  { nombre: 'Routers WIFI', cate: 83, scrapeSpecs: false },
  { nombre: 'Toners', cate: 28, scrapeSpecs: false },
  { nombre: 'UPS', cate: 111, scrapeSpecs: false},
  { nombre: 'Estabilizadores', cate: 31, scrapeSpecs: false },
  { nombre: 'Consolas de videojuego', cate: 109, scrapeSpecs: false },
  { nombre: 'Cables y adaptadores', cate: 21, scrapeSpecs: false },
  { nombre: 'Impresoras y Multifunciones', cate: 3, scrapeSpecs: false },
  { nombre: 'Televisores', cate: 79, scrapeSpecs: false },
  { nombre: 'Auriculares', cate: 8, scrapeSpecs: false },
  { nombre: 'Teclados', cate: 39, scrapeSpecs: false},
  { nombre: 'Mouses', cate: 2, scrapeSpecs: false },
  { nombre: 'Webcam', cate: 13, scrapeSpecs: false },
  { nombre: 'Joysitcks', cate: 18, scrapeSpecs: false },
  { nombre: 'Mousepads', cate: 38, scrapeSpecs: false},
  { nombre: 'Parlantes', cate: 65, scrapeSpecs: false },
  { nombre: 'Combos Teclados, Mouses y otros', cate: 72, scrapeSpecs: false },
  { nombre: 'Microfonos', cate: 74, scrapeSpecs: false },
  { nombre: 'Volantes - Simuladores de manejo', cate: 84, scrapeSpecs: false},
  { nombre: 'Stream Deck', cate: 113, scrapeSpecs: false },
]

const extraerSpecs = async (page, item) => {
  try {
    // Abrimos el producto en una pestaña nueva
    const nuevaPagina = await page.browser().newPage()
    
    await nuevaPagina.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

    // Interceptamos la navegación para capturar la URL
    await nuevaPagina.goto('https://www.compragamer.com/productos', {
      waitUntil: 'networkidle2'
    })

    const url = await page.evaluate(() => {
      const link = document.querySelector('.product-card a')
      return link ? window.location.origin + link.getAttribute('href') : ''
    })

    console.log('URL capturada:', url)
    await nuevaPagina.close()
    return {}

  } catch (error) {
    return {}
  }
}

const scrapearCategoria = async (page, categoria) => {
  console.log(`\n📦 Scrapeando categoría: ${categoria.nombre}`)

    await page.goto(`https://www.compragamer.com/productos?categoria=1&cate=${categoria.cate}`, {
    waitUntil: 'networkidle2',
    timeout: 60000
    })

  await page.waitForSelector('.product-card', { timeout: 15000 })
  await new Promise(r => setTimeout(r, 3000))

  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0
      const distance = 500
      const timer = setInterval(() => {
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 300)
    })
  })
  await new Promise(r => setTimeout(r, 2000))

  const productos = await page.evaluate((categoriaNombre) => {
    const items = document.querySelectorAll('.product-card')
    const resultado = []

    items.forEach(item => {
      const nombre = item.querySelector('[class*="title"], [class*="name"], h2, h3')?.innerText?.trim()
      const precioTexto = item.querySelector('[class*="price"], [class*="precio"]')?.innerText?.trim()
      const imagen = item.querySelector('img')?.src

      // Buscamos el link en el item o en su padre
      const url = item.querySelector('a')?.href || ''

      if (nombre && precioTexto) {
        const precio = parseFloat(
          precioTexto.replace(/[^0-9,]/g, '').replace(',', '.').trim()
        )

        if (!isNaN(precio) && precio > 0) {
          resultado.push({ nombre, precio, imagen, url, categoria: categoriaNombre })
        }
      }
    })

    return resultado
  }, categoria.nombre)

  console.log('URL primer producto:', productos[0]?.url)
console.log('Nombre primer producto:', productos[0]?.nombre)

  if (categoria.scrapeSpecs) {
    console.log(`🔬 Extrayendo specs de ${productos.length} productos...`)
    for (let i = 0; i < productos.length; i++) {
      if (productos[i].url) {
        productos[i].specs = await extraerSpecs(page, productos[i].url)
        console.log(`   ${i + 1}/${productos.length} - ${productos[i].nombre.substring(0, 40)}`)
        await new Promise(r => setTimeout(r, 1000))
      }
    }
    console.log('Specs del primer producto:', JSON.stringify(productos[0]?.specs, null, 2))
  }
  console.log('a Specs del primer producto:', JSON.stringify(productos[0]?.specs, null, 2))
  console.log(`✅ ${productos.length} productos encontrados en ${categoria.nombre}`)
  return productos
}

const scrapeCompraGamer = async () => {
  console.log('🚀 Iniciando scraper de Compra Gamer...')
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    let totalGuardados = 0

    for (const categoria of CATEGORIAS) {
      try {
        const productos = await scrapearCategoria(page, categoria)

        for (const producto of productos) {
          await Product.findOneAndUpdate(
            { nombre: producto.nombre, tienda: 'Compra Gamer' },
            {
              ...producto,
              tienda: 'Compra Gamer',
              ultimaActualizacion: new Date()
            },
            { upsert: true, returnDocument: 'after' }
          )
          totalGuardados++
        }

        // Pausa entre categorías para no saturar el servidor
        await new Promise(r => setTimeout(r, 2000))

      } catch (error) {
        console.error(`❌ Error en categoría ${categoria.nombre}:`, error.message)
        // Si falla una categoría continuamos con la siguiente
        continue
      }
    }

    console.log(`\n💾 Total guardados en MongoDB: ${totalGuardados} productos`)

  } catch (error) {
    console.error('❌ Error general:', error.message)
  } finally {
    await browser.close()
  }
}

module.exports = scrapeCompraGamer