from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import engine, get_db, Base
from models import Medico, Paciente, Lesao
import bcrypt

SECRET_KEY = "sua_chave_secreta_super_segura" 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DermaScan AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_medico_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        medico_id: str = payload.get("sub")
        if medico_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return int(medico_id)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado ou inválido")


class RegisterRequest(BaseModel):
    nome: str
    crm: str
    estado: str
    senha: str

class LoginRequest(BaseModel):
    crm: str
    estado: str
    senha: str

class PacienteCreate(BaseModel):
    nome: str
    idade: int
    cpf: str


@app.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    medico_existente = db.query(Medico).filter(Medico.crm == request.crm, Medico.estado == request.estado).first()
    if medico_existente:
        raise HTTPException(status_code=400, detail="CRM já cadastrado.")
    
    senha_hash = bcrypt.hashpw(request.senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    novo_medico = Medico(nome=request.nome, crm=request.crm, estado=request.estado, senha=senha_hash)
    db.add(novo_medico)
    db.commit()
    return {"message": "Médico cadastrado com sucesso!"}

@app.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    medico = db.query(Medico).filter(Medico.crm == request.crm, Medico.estado == request.estado).first()
    
    if not medico or not bcrypt.checkpw(request.senha.encode('utf-8'), medico.senha.encode('utf-8')):
        raise HTTPException(status_code=401, detail="CRM ou senha incorretos.")

    
    access_token = create_access_token(data={"sub": str(medico.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "medico_nome": medico.nome,
        "medico_id": medico.id
    }

@app.get("/pacientes")
def listar_pacientes(db: Session = Depends(get_db), current_medico_id: int = Depends(get_current_medico_id)):
   
    return db.query(Paciente).filter(Paciente.medico_id == current_medico_id).all()

@app.post("/pacientes")
def criar_paciente(request: PacienteCreate, db: Session = Depends(get_db), current_medico_id: int = Depends(get_current_medico_id)):
    novo_paciente = Paciente(
        nome=request.nome,
        idade=request.idade,
        cpf=request.cpf,
        medico_id=current_medico_id, 
        ultima_consulta=datetime.now().strftime("%d/%m/%Y"),
        lesoes=0,
        risco="BAIXO RISCO"
    )
    db.add(novo_paciente)
    db.commit()
    return {"message": "Paciente cadastrado com sucesso!"}


@app.get("/pacientes/{paciente_id}")
def obter_detalhes_paciente(
    paciente_id: int, 
    db: Session = Depends(get_db), 
    current_medico_id: int = Depends(get_current_medico_id)
):
  
    paciente = db.query(Paciente).filter(
        Paciente.id == paciente_id, 
        Paciente.medico_id == current_medico_id
    ).first()

    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    lesoes = db.query(Lesao).filter(Lesao.paciente_id == paciente_id).all()

    return {
        "paciente": paciente,
        "lesoes": lesoes
    }

@app.get("/me")
def obter_perfil_medico(db: Session = Depends(get_db), current_medico_id: int = Depends(get_current_medico_id)):
    medico = db.query(Medico).filter(Medico.id == current_medico_id).first()
    return {"nome": medico.nome, "crm": medico.crm, "estado": medico.estado}