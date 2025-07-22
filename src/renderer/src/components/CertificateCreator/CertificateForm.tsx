import { TextInput } from "@mantine/core";
import { CertificateFormProps } from "./types/certificateForm";

const inputClassNames = {
  input:
    "bg-white text-black border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400",
  label: "text-gray-900 dark:text-gray-200",
};

const CertificateForm = ({ form, handleChange }: CertificateFormProps) => (
  <>
    <TextInput
      label="Nombre del país (código de 2 letras)"
      placeholder="Ej: EC"
      value={form.country}
      onChange={(e) => handleChange("country", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre de la provincia o estado"
      placeholder="Ej: Esmeraldas"
      value={form.state}
      onChange={(e) => handleChange("state", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre de la localidad (ciudad)"
      placeholder="Ej: Esmeraldas"
      value={form.locality}
      onChange={(e) => handleChange("locality", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre de la organización"
      placeholder="Ej: PUCESE"
      value={form.organization}
      onChange={(e) => handleChange("organization", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre de la unidad organizativa"
      placeholder="Ej: TIC"
      value={form.orgUnit}
      onChange={(e) => handleChange("orgUnit", e.target.value)}
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre común (FQDN o tu nombre)"
      placeholder="Ej: pucese.edu.ec"
      value={form.commonName}
      onChange={(e) => handleChange("commonName", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Email"
      placeholder="Ej: abbaski@gmail.com"
      value={form.email}
      onChange={(e) => handleChange("email", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Contraseña de desafío"
      placeholder="Contraseña"
      value={form.challengePassword}
      onChange={(e) => handleChange("challengePassword", e.target.value)}
      required
      mt="md"
      classNames={inputClassNames}
    />
    <TextInput
      label="Nombre de la empresa (opcional)"
      placeholder="Ej: Kingdom PC"
      value={form.optionalCompany}
      onChange={(e) => handleChange("optionalCompany", e.target.value)}
      mt="md"
      classNames={inputClassNames}
    />
  </>
);

export default CertificateForm;