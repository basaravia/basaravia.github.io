import Foundation
import Vision
import CoreImage

// OCR y detección de rostros con el framework Vision de Apple (corre en el Neural Engine y la GPU).
// Imprime una línea JSON por imagen: texto reconocido y cajas de rostros (x, y, ancho, alto en fracciones).
// Lo compila y usa tools/verificar_fotos.py; no se ejecuta en la publicación.
for path in CommandLine.arguments.dropFirst() {
    guard let image = CIImage(contentsOf: URL(fileURLWithPath: path)) else { continue }
    let text = VNRecognizeTextRequest()
    text.recognitionLevel = .accurate
    text.recognitionLanguages = ["es-ES", "en-US"]
    let faces = VNDetectFaceRectanglesRequest()
    try? VNImageRequestHandler(ciImage: image).perform([text, faces])
    let lines = (text.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    let boxes = (faces.results ?? []).map { f in [f.boundingBox.minX, 1 - f.boundingBox.maxY, f.boundingBox.width, f.boundingBox.height].map { ($0 * 100).rounded() / 100 } }
    let out: [String: Any] = ["file": path, "text": lines, "faces": boxes]
    print(String(data: try! JSONSerialization.data(withJSONObject: out), encoding: .utf8)!)
}
