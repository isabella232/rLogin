// eslint-disable-next-line
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { SD } from '../../lib/sdr'
import { Header2, SmallSpan, typeShared } from '../../ui/shared/Typography'
import { Button, ButtonSecondary } from '../../ui/shared/Button'
import { credentialValueToText } from '../../vc-json-schema-adapter'
import Loading from '../../ui/shared/Loading'
import { Trans } from 'react-i18next'
import i18next from 'i18next'
import { getChainName } from '../../adapters'
import { IProviderUserOptions } from 'web3modal'
import Checkbox from '../../ui/shared/Checkbox'
import { LIST_TITLE, LIST_DESCRIPTION } from '../../constants/cssSelectors'

const DONT_SHOW_AGAIN_KEY = 'RLogin:DontShowAgain'

interface ConfirmInformationProps {
  chainId: number | undefined
  address: string | undefined
  sd: SD | undefined
  providerUserOption: IProviderUserOptions
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmInformation ({ chainId, address, providerUserOption, sd, onConfirm, onCancel }: ConfirmInformationProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dontShowAgainSelected, setDontShowAgainSelected] = useState<boolean>(false)
  const data = sd ? Object.assign({}, sd.credentials, sd.claims) : {}

  const handleSubmit = () => {
    setIsLoading(true)
    onConfirm()
  }

  useEffect(() => {
    const DONT_SHOW_AGAIN_DEFAULT: boolean =
      localStorage.getItem(DONT_SHOW_AGAIN_KEY) ? JSON.parse(localStorage.getItem(DONT_SHOW_AGAIN_KEY)!) : false

    if (DONT_SHOW_AGAIN_DEFAULT) {
      handleSubmit()
    }
  }, [])

  return !isLoading
    ? <>
      <Header2><Trans>Information</Trans></Header2>
      <CenterContent>
        <ProviderLogo>
          <img src={providerUserOption.logo} alt={providerUserOption.name} />
        </ProviderLogo>
      </CenterContent>

      <List>
        <Column>
          <Title><Trans>Wallet address</Trans>:</Title>
          <Title><Trans>Network</Trans>:</Title>
          {sd && Object.keys(sd.claims).map(key => <Title key={`claim-key-${key}`}>{key}:</Title>)}
          {sd && Object.keys(sd.credentials).map(key => <Title key={`credential-key-${key}`}>{key}:</Title>)}
        </Column>
        <Column>
          <Description>{shortAddress(address)}</Description>
          <Description>{chainId && getChainName(chainId)}</Description>
          {sd && Object.keys(sd.claims).map(key => <Description key={`claim-value-${key}`}>{data[key]}</Description>)}
          {sd && Object.keys(sd.credentials).map(key => <Description key={`credential-value-${key}`}>{credentialValueToText(key, data[key])}</Description>)}
        </Column>
      </List>
      <CenterContent>
        <ButtonSecondary onClick={onCancel} disabled={isLoading}><Trans>Cancel</Trans></ButtonSecondary>
        <Button onClick={handleSubmit} disabled={isLoading}><Trans>Confirm</Trans></Button>
      </CenterContent>
      <CenterContent>
        <label style={{ marginTop: 20 }}>
          <Checkbox checked={dontShowAgainSelected} onChange={() => setDontShowAgainSelected(prev => {
            localStorage.setItem(DONT_SHOW_AGAIN_KEY, JSON.stringify(!prev))
            return !prev
          })} />
          <SmallSpan><Trans>Don’t show again</Trans></SmallSpan>
        </label>
      </CenterContent>
    </>
    : <Loading text={i18next.t('Confirming Identity')} size={10} />
}

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const List = styled.dl`
  display: flex;
  padding: 50px 0;
  justify-content: center;
  gap: 30px;
`

const TitleWrapper = styled.dt`
  ${typeShared}
  font-weight: 500 !important;
  font-size: 16px;
  color: ${props => props.theme.p};
  margin: 6px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  text-align: left;
`
export const Title: React.FC<{ className?: string; }> = ({ children, className }) => (
  <TitleWrapper className={className ? `${LIST_TITLE} ${className}` : LIST_TITLE}>
    {children}
  </TitleWrapper>
)

const DescriptionWrapper = styled.dd`
  ${typeShared}
  font-weight: 400 !important;
  font-size: 16px;
  color: ${props => props.theme.secondaryText};
  margin: 6px 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 150px;
  text-align: left;
`
export const Description: React.FC<{ className?: string; }> = ({ children, className }) => (
  <DescriptionWrapper className={className ? `${LIST_DESCRIPTION} ${className}` : LIST_DESCRIPTION}>
    {children}
  </DescriptionWrapper>
)

const CenterContent = styled.div`
  display: flex; 
  gap: 16px;
  justify-content: center;
`

const ProviderLogo = styled.div`
  margin-top: 30px;
  width: 85px;
  height: 85px;
  display: flex;
  justify-content: center;
  align-items: center;
  & img {
    width: 100%;
    height: 100%;
  }
`

function shortAddress (address?: string): string {
  if (!address) return ''

  return `${address.substr(0, 6)}...${address.substr(
    address.length - 4,
    address.length
  )}`
}
