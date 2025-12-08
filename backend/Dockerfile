# ===== STAGE 1: Install heavy dependencies =====
FROM python:3.11-slim AS builder

WORKDIR /app

# Ставим системные библиотеки для numpy/pandas/scikit-learn/torch
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем только requirements (кэшируем слой!)
COPY requirements.txt .

# Создаём виртуальное окружение
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    \
    # === ВАЖНО: ставим torch CPU-only ===
    /opt/venv/bin/pip install --no-cache-dir torch==2.1.2+cpu \
    -f https://download.pytorch.org/whl/torch_stable.html && \
    \
    # === Теперь ставим остальные зависимости ===
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

# ===== STAGE 2: Clean small final image =====
FROM python:3.11-slim

WORKDIR /app

# Добавляем виртуальное окружение из предыдущего stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем только код проекта
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
