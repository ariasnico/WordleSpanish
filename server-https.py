#!/usr/bin/env python3
"""
Servidor HTTPS simple para desarrollo con Auth0
"""
import http.server
import ssl
import socketserver
import os
import subprocess
import sys

PORT = 8443

# Crear certificados autofirmados si no existen
def create_self_signed_cert():
    cert_file = 'localhost.pem'
    key_file = 'localhost-key.pem'
    
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("🔐 Creando certificados SSL autofirmados...")
        try:
            # Crear certificado autofirmado
            cmd = [
                'openssl', 'req', '-x509', '-newkey', 'rsa:4096', '-keyout', key_file,
                '-out', cert_file, '-days', '365', '-nodes', '-subj',
                '/C=AR/ST=CABA/L=BuenosAires/O=WordleLocal/CN=localhost'
            ]
            subprocess.run(cmd, check=True, capture_output=True)
            print("✅ Certificados SSL creados exitosamente")
            return cert_file, key_file
        except subprocess.CalledProcessError:
            print("❌ Error: OpenSSL no está disponible")
            print("💡 Instala OpenSSL o usa el modo invitado")
            return None, None
        except FileNotFoundError:
            print("❌ Error: OpenSSL no encontrado en el sistema")
            print("💡 En Ubuntu/Debian: sudo apt install openssl")
            print("💡 O usa el modo invitado del juego")
            return None, None
    
    return cert_file, key_file

def start_https_server():
    cert_file, key_file = create_self_signed_cert()
    
    if not cert_file or not key_file:
        print("❌ No se pueden crear certificados SSL")
        print("🎮 Usa 'python3 -m http.server 8080' y el modo invitado")
        sys.exit(1)
    
    # Configurar servidor HTTPS
    handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), handler) as httpd:
            # Configurar SSL
            context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            context.load_cert_chain(cert_file, key_file)
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            print(f"🚀 Servidor HTTPS iniciado en puerto {PORT}")
            print(f"🌐 Abre: https://localhost:{PORT}")
            print("⚠️  Acepta el certificado autofirmado en tu navegador")
            print("🎮 ¡Ahora Auth0 debería funcionar correctamente!")
            print("🛑 Presiona Ctrl+C para detener")
            
            httpd.serve_forever()
            
    except PermissionError:
        print(f"❌ Error: No hay permisos para usar el puerto {PORT}")
        print("💡 Prueba con: sudo python3 server-https.py")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Error: Puerto {PORT} ya está en uso")
            print(f"💡 Detén otros servidores o cambia el puerto")
        else:
            print(f"❌ Error de red: {e}")

if __name__ == "__main__":
    start_https_server() 