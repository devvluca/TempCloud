import requests
import time
import random

device_token = "2f7b3984-6543-4e0c-b8cf-6b9d2bd6382e"

headers = {
    "Content-Type": "application/json",
    "Device-Token": device_token
}

url = "https://api.tago.io/data"
contador = 0

def enviar_dados():
    global contador
    contador += 1
    # Uma vez a cada 5 envios, gera uma temperatura > 40
    if contador % 5 == 0:
        temperatura_atual = round(random.uniform(40.1, 42.0), 2)
    else:
        temperatura_atual = round(random.uniform(24.0, 26.0), 2)

    temperatura_maxima = 40.00
    temperatura_minima = 20.00
    temperatura_media = 25.37

    # Lista com todas as variáveis para os widgets
    payload = [
        {
            "variable": "real_time_temperature",
            "value": temperatura_atual,
            "unit": "°C"
        },
        {
            "variable": "maximum_temperature",
            "value": temperatura_maxima,
            "unit": "°C"
        },
        {
            "variable": "minimum_temperature",
            "value": temperatura_minima,
            "unit": "°C"
        },
        {
            "variable": "average_temperature",
            "value": temperatura_media,
            "unit": "°C"
        },
        {
            "variable": "temperature",  # Para gráfico (historical)
            "value": temperatura_atual,
            "unit": "°C"
        }
    ]

    response = requests.post(url, json=payload, headers=headers)
    if response.status_code in [200, 202]:
        print(f"✅ Enviado com sucesso: {temperatura_atual}°C (real-time)")
    else:
        print(f"❌ Erro {response.status_code}: {response.text}")

# Loop para envio contínuo
while True:
    enviar_dados()
    time.sleep(10)  # TagoIO permite 1 envio a cada 10-15 segundos