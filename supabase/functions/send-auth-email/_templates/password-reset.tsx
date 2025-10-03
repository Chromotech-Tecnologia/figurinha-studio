import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  token: string
}

export const PasswordResetEmail = ({
  resetUrl,
  token,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Recupere sua senha do Figurinha Studio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://zpswmiolrywnvwfhijaw.supabase.co/storage/v1/object/public/pack-images/figurinha-logo.png"
            width="120"
            height="120"
            alt="Figurinha Studio"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Recuperação de Senha 🔐</Heading>
        <Text style={text}>
          Recebemos uma solicitação para redefinir a senha da sua conta no Figurinha Studio.
        </Text>
        <Text style={text}>
          Clique no botão abaixo para criar uma nova senha:
        </Text>
        <Section style={buttonSection}>
          <Link
            href={resetUrl}
            target="_blank"
            style={button}
          >
            Redefinir minha senha
          </Link>
        </Section>
        <Text style={{ ...text, marginTop: '32px' }}>
          Ou copie e cole este código de recuperação:
        </Text>
        <code style={code}>{token}</code>
        <Text
          style={{
            ...text,
            color: '#e74c3c',
            marginTop: '32px',
            fontWeight: 'bold',
          }}
        >
          ⚠️ Este link expira em 1 hora por segurança.
        </Text>
        <Text
          style={{
            ...text,
            color: '#666',
            marginTop: '16px',
            fontSize: '12px',
          }}
        >
          Se você não solicitou a recuperação de senha, pode ignorar este email com segurança. Sua senha não será alterada.
        </Text>
        <Text style={footer}>
          <Link
            href="https://figurinhastudio.com.br"
            target="_blank"
            style={{ ...link, color: '#9b87f5' }}
          >
            Figurinha Studio
          </Link>
          {' '}- Transforme suas ideias em figurinhas incríveis!
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginTop: '40px',
  marginBottom: '40px',
  borderRadius: '12px',
  maxWidth: '600px',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  margin: '0 auto',
  borderRadius: '12px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#9b87f5',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
}

const link = {
  color: '#9b87f5',
  textDecoration: 'none',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '48px',
  textAlign: 'center' as const,
}

const code = {
  display: 'inline-block',
  padding: '16px 24px',
  width: '100%',
  backgroundColor: '#f4f4f4',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  letterSpacing: '2px',
  fontFamily: 'monospace',
}
