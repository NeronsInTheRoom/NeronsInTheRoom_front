### whisper(STT)
from fastapi import FastAPI, UploadFile
from transformers import pipeline
from io import BytesIO
import soundfile as sf

# Whisper 모델을 사용한 음성 인식 파이프라인 생성
whisper_small = pipeline("automatic-speech-recognition", "openai/whisper-small")

app = FastAPI()

@app.post("/uploadfile/")
async def create_upload_file(file: UploadFile):
    
    # 파일 내용을 바이트로 읽어들임
    contents = await file.read()
    
    # 바이트 데이터를 BytesIO 객체로 변환
    audio_stream = BytesIO(contents)

    # BytesIO 객체에서 numpy 배열로 변환
    audio_data, sample_rate = sf.read(audio_stream)

    # 오디오 파일을 텍스트로 변환
    result = whisper_small({"array": audio_data, "sampling_rate": sample_rate}, generate_kwargs={"language": "korean"})

    # 변환된 텍스트를 반환
    return {"text": result['text']}