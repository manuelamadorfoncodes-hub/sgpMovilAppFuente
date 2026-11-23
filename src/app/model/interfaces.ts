export interface RespuestaTopHeadLines {
  status: string;
  totalResults: number;
  articles: Article[];
}

export interface Article {
  source: Source;
  author?: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  content: string;
}

export interface Source {
  id?: string;
  name: string;
}

export interface RespApi {
  status: number
  result: Noticia[]
  message: string
}

export interface Noticia {
  fecha?: string
  fuente?: string
  titulo?: string
  detalle?: string
  urlNoticia?: string
  urlImagen?: string
}

export interface Categoria {
    idCategoria: number
    nombreCategoria: string
}

export interface Userx {
    correo: string
    categorias: Categoria[]
}

export interface Resp {
    status: number
    result: any
    message: string
}

export interface ProyectoAsignado {
    codexpediente: string
    codconvenio: string
    txtproyecto: string
    nidfuncion: number
    nidpersonal: number
    nidasignacion: number
}

export interface Informe {
  codexpediente: string
  nidfuncion: number
  nidpersonal: number
  nidasignacion: number
  nidinforme: number
  codmes: string;
  txtobservacion: string;
}
