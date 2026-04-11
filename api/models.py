from sqlalchemy import Column, Integer, String, ForeignKey, Text
from database import Base

class Medico(Base):
    __tablename__ = "medicos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100))
    crm = Column(String(20), unique=True, index=True)
    estado = Column(String(2))
    senha = Column(String(255))

class Paciente(Base):
        __tablename__ = "pacientes"

        id = Column(Integer, primary_key=True, index=True)
        nome = Column(String(100))
        idade = Column(Integer)
        cpf = Column(String(14))
        ultima_consulta = Column(String(20))
        lesoes = Column(Integer, default=0)
        risco = Column(String(20))
        
        medico_id = Column(Integer, ForeignKey("medicos.id"))

class Lesao(Base):
    __tablename__ = "lesoes"

    id = Column(Integer, primary_key=True, index=True)
    data = Column(String(20))
    localizacao = Column(String(100))
    descricao = Column(Text)
    risco = Column(String(20))
    paciente_id = Column(Integer, ForeignKey("pacientes.id"))