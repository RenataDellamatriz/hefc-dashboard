import { Replacement } from "@react-input/mask";

// Máscara de CPF: 000.000.000-00
export const cpfMask = "___.___.___-__";
export const cpfReplacement: Replacement = { _: /\d/ };

// Máscara de CNPJ: 00.000.000/0000-00
export const cnpjMask = "__.___.___/____-__";
export const cnpjReplacement: Replacement = { _: /\d/ };

// Máscara de RG: aceita vários formatos, usando o mais comum XX.XXX.XXX-X
export const rgMask = "__.___.___-_";
export const rgReplacement: Replacement = { _: /\d/ };

// Máscara de telefone: aceita (00) 0000-0000 (fixo) ou (00) 00000-0000 (celular)
// A máscara aceita até 11 dígitos (celular com 9º dígito)
// Se o usuário digitar apenas 10 dígitos, será tratado como telefone fixo
export const phoneMask = "(__) _____-____";
export const phoneReplacement: Replacement = { _: /\d/ };

// Máscara de CEP: 00000-000
export const cepMask = "_____-___";
export const cepReplacement: Replacement = { _: /\d/ };

