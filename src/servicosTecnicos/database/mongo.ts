import mongoose from 'mongoose';

export async function conectarBancoDeDados(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não configurada');

  await mongoose.connect(uri);
  console.log('✅ MongoDB conectado');

  mongoose.connection.on('error', (err) => {
    console.error('❌ Erro MongoDB:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB desconectado');
  });
}
