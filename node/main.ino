#include <LiquidCrystal.h>
#include <EEPROM.h>

const int pinCooler = 6;
const int pinHeater = 7;
const int pinLcdV0 = 9;
const int pinLcdLedPlus = 8;

const int pinThermometer = A5;
const int pinButtonMain = A4;
const int pinButtonPlus = A3;
const int pinButtonMinus = A2;
const float minTemp = -50;
const float tempPerVolt = 100;
const float maxTemp = minTemp + 5 * tempPerVolt;

const unsigned long maxMilis = (2^32 - 1); // schedulerSensitivity
const int schedulerSensitivity = 512; //2^9
unsigned long lastSchedulerTimestamp = 0;
unsigned long curentSchedulerTimestamp;
class SchedulerEvent {
  private:
    bool isActive = false;
    unsigned long sheduledTime = 0;
  public:
    SchedulerEvent(){};
    void CorrectSchedulerOverflow()
    {
      if(isActive)
      {
        if(sheduledTime > maxMilis)
        {
          sheduledTime = sheduledTime - maxMilis;
        }
        else
        {
          //scheduled time was close to the end of milis run it on the next frame
          sheduledTime = 0;
        }
      }
    }
    bool IsScheduleElapsed()
    {
      if(isActive && sheduledTime < curentSchedulerTimestamp)
      {
        isActive = false;
        return true;
      }
      return false;
    }
    bool IsActive()
    {
      return isActive;
    }
    void SetNextRun(unsigned long nextRun)
    {
      isActive = true;
      sheduledTime = nextRun;
    }
    void SetNextRunOffset(unsigned long nextRunOffset)
    {
      isActive = true;
      sheduledTime = curentSchedulerTimestamp + nextRunOffset;
    }
};

SchedulerEvent schedulerEvents[2];
int SchedulerScreenShutoffEventId = 0;
int SchedulerReportMeasurmentEventId = 1;
int reportMeasumentDelay = 1200; //~10min

String serialCauseTempOut = "tempOut";
String serialCauseStateChange = "stateChange";
String serialCauseUpdateRange = "updateRange";

class ParamData {
  public:
    ParamData(bool isStringDatatype, String valueString, String paramName)
    {
      IsStringDatatype = isStringDatatype;
      ValueString = valueString;
      ParamName = paramName;
    }
    bool IsStringDatatype;
    String ValueString;
    String ParamName;
};

class TempStateClass {
  public:
    TempStateClass(){}
    static const int NoAction = 0;
    static const int Heater = 1;
    static const int Cooler = 2;
};

TempStateClass TempState;
int tempStateId = TempState.NoAction;
float tempCoolerStart;
float tempCoolerEnd;
float tempHeaterStart;
float tempHeaterEnd;
float tempSettingUpdate;
float tempSettingUpdateMax;
float tempSettingUpdateMin;

int adressTempCoolerStart = 0;
int adressTempHeaterStart = 4;

class TempStatus
{
  public:
    float ThermTemp;
    bool TempStateChanged;
    TempStatus(float thermTemp, bool tempStateChanged)
    {
      ThermTemp = thermTemp;
      TempStateChanged = tempStateChanged;
    } 
};

class LcdStateClass {
  public:
    LcdStateClass(){}
    static const int Inactive = 0;
    static const int Status = 1;
    static const int Temp = 2;
    static const int CoolerSetting = 3;
    static const int CoolerSettingUpdate = 4;
    static const int HeaterSetting = 5;
    static const int HeaterSettingUpdate = 6;
};
LcdStateClass LcdState;
int lcdStateId = LcdState.Inactive;
LiquidCrystal lcd(12, 11, 5, 4, 3,2);


void setup() {
  // put your setup code here, to run once:
  pinMode(pinCooler, OUTPUT);
  pinMode(pinHeater, OUTPUT);
  pinMode(pinLcdV0, OUTPUT);
  pinMode(pinLcdLedPlus, OUTPUT);

  digitalWrite(pinCooler, LOW);
  digitalWrite(pinHeater, LOW);
  digitalWrite(pinLcdV0, LOW);
  digitalWrite(pinLcdLedPlus, LOW);

  lcd.begin(16, 2);
  lcd.noDisplay();

  Serial.begin(9600);
  
  if(!readFloatFromEEPROM(adressTempCoolerStart, &tempCoolerStart))
  {
    tempCoolerStart = 70;
  }
  tempCoolerEnd = tempCoolerStart - 5;

  if(!readFloatFromEEPROM(adressTempHeaterStart, &tempHeaterStart))
  {
    tempHeaterStart = 50;
  }
  tempHeaterEnd = tempHeaterStart + 5;

  schedulerEvents[SchedulerScreenShutoffEventId] = SchedulerEvent();
  schedulerEvents[SchedulerReportMeasurmentEventId] = SchedulerEvent();
  schedulerEvents[SchedulerReportMeasurmentEventId].SetNextRunOffset(reportMeasumentDelay);
}

typedef union
{
  float number;
  uint8_t bytes[4];
} EEPROM_FLOAT;

bool readFloatFromEEPROM(int adress, float* outputValue)
{

  bool allNoValue = true;
  
  EEPROM_FLOAT eepromValue;
  for(int offset = 0;offset < 4; offset++)
  {
    uint8_t byteValue = EEPROM.read(adress + offset);
    if(byteValue != 255)
    {
      allNoValue = false;
    }
    eepromValue.bytes[offset] = byteValue;
  }
  if(allNoValue)
  {
    return false;
  }
  else
  {
    *outputValue = eepromValue.number;
    return true;
  }
}
void writeFloatToEEPROM(int adress, float value)
{
  EEPROM_FLOAT eepromValue;
  eepromValue.number = value;
  for(int offset = 0;offset < 4; offset++)
  {
    EEPROM.write(adress + offset, eepromValue.bytes[offset]);
  }
}

void loop() {
  schedulerUpdate();
  checkSerialIn();
  TempStatus tempStatus = updateTempRegulation();
  updateLcd(tempStatus);
  checkComunicationSchedule(tempStatus.ThermTemp);
  delay(1000);
}
void schedulerUpdate()
{
  
  // put your main code here, to run repeatedly:

  //jedna iterace loop je +- 1000ms
  //z tohoto duvodu nepotřebujem tak moc přesnou konverzi z ms od startu do schuler timestampu
  //nechceme 1:1 vztah mezi millis a timestampem protože milis overflowne jednou za ~51 dni, což by mohlo způsobit selhani scheduleru;
  curentSchedulerTimestamp = millis() / schedulerSensitivity;

  if(lastSchedulerTimestamp > curentSchedulerTimestamp)
  {
    //došlo k overflow millis()
    int itemCount =sizeof schedulerEvents/sizeof schedulerEvents[0];
    for (int i=0; i<itemCount; i++) {
        schedulerEvents[i].CorrectSchedulerOverflow();
    }
  }

  lastSchedulerTimestamp = curentSchedulerTimestamp;
}

int const headerSize = 3;
char const packetstart = '\n';
class Packet{
  private:
    byte messageBody[63];
    byte bytesWriten = 0;
    byte bytesRead = 0;
  public:
    Packet(){}
    byte BytesRead = 0;
    byte MessageLenght = -1;
    int MessageTypeId = -1;
    void ResetData()
    {
          Serial.println("reset");
      BytesRead = 0;
      MessageLenght = -1;
      MessageTypeId = -1;
      bytesWriten = 0;
      bytesRead = 0;
    }
    bool WriteByte(byte data)
    {
      if(bytesWriten < 63)
      {
        messageBody[bytesWriten] = data;
        bytesWriten++;
        return true;
      }
      else
      {
        return false;
      }
    }
    int ReadByte()
    {
      if(bytesRead == bytesWriten)
      {
        return -1;
      }
      else
      {
        byte data =messageBody[bytesRead];
        bytesRead++;
        return data;        
      }
    }
};
Packet readHeaderData = Packet(); 
void checkSerialIn()
{

  int unreadBytes = Serial.available();
  if(unreadBytes >= headerSize - readHeaderData.BytesRead)
  {
    byte data;
    switch(readHeaderData.BytesRead)
    {
      case 0:
        while(readHeaderData.BytesRead == 0 && unreadBytes >= headerSize)
        {
          if(packetstart == Serial.read())
          {
            readHeaderData.BytesRead++;
          }
          unreadBytes--;
        }
        if(readHeaderData.BytesRead == 0)
        {
          break;
        }
      case 1:
        readHeaderData.MessageLenght = Serial.read();
        unreadBytes--;
        readHeaderData.BytesRead++;
      case 2:
        readHeaderData.MessageTypeId = Serial.read();
        unreadBytes--;
        readHeaderData.BytesRead++;
      case 3:
        Serial.print("to read");
        Serial.print(readHeaderData.MessageLenght);
        Serial.print("bytes");
        Serial.println(unreadBytes);
        if(unreadBytes >= readHeaderData.MessageLenght)
        {
          for (int i=0; i<readHeaderData.MessageLenght; i++)
          {
            readHeaderData.WriteByte(Serial.read());
          }
          int data = readHeaderData.ReadByte();
          while(data != -1)
          {
            char databyte = data;
            Serial.print(databyte);
            data = readHeaderData.ReadByte();
          }
          Serial.println("");
          readHeaderData.ResetData();
        }
        break;
    }
  }
}

TempStatus updateTempRegulation()
{
  int thermVal = analogRead(pinThermometer);
  // analogRead vrací číslo mezi 0 a 1023 proto deleni 1024, nasobení 5 je protože to je maximalni napětí
  float thermVolt = (thermVal / 1024.0) * 5;
  //TODO double check expresion
  float thermTemp = minTemp + thermVolt * tempPerVolt;

  bool tempStateChanged = false;
  switch(tempStateId)
  {
    case TempState.Heater:
      if(thermTemp > tempHeaterEnd)
      {
        digitalWrite(pinHeater, LOW);
        tempStateId = TempState.NoAction;
        tempStateChanged= true;
      }
      break;
    case TempState.Cooler:
      if(thermTemp < tempCoolerEnd)
      {
        digitalWrite(pinCooler, LOW);
        tempStateId = TempState.NoAction;
        tempStateChanged = true;
      }
      break;
    case TempState.NoAction:
    default:
      if(thermTemp < tempHeaterStart)
      {
        digitalWrite(pinHeater, HIGH);
        tempStateId = TempState.Heater;
        tempStateChanged = true;
      }
      else if (thermTemp > tempCoolerStart)
      {
        digitalWrite(pinCooler, HIGH);
        tempStateId = TempState.Cooler;
        tempStateChanged = true;
      }
      break;
  }
  if(tempStateChanged)
  {
    sendStateChenge();
  }
  return TempStatus(thermTemp, tempStateChanged);
}

void sendStateChenge()
{
  String newState;
  switch(tempStateId)
  {
    case TempState.Heater:
      newState = "Heating";
      break;
    case TempState.Cooler:
      newState = "Cooling";
      break;
    case TempState.NoAction:
      newState = "Idle";
    default:
      break;
  }
  ParamData params[] = {ParamData(true, newState, "newState")};
  sendSerialMessage(serialCauseStateChange, params, sizeof params/sizeof params[0]);
}

void updateLcd(TempStatus tempStatus)
{
  int buttonMainVal = analogRead(pinButtonMain);
  bool buttonMainState = buttonMainVal >= 256;
  int buttonPlusVal = analogRead(pinButtonPlus);
  bool buttonPlusState = buttonPlusVal >= 256;
  int buttonMinusVal = analogRead(pinButtonMinus);
  bool buttonMinusState = buttonMinusVal >= 256;
  bool buttonPressed = true;
  switch(lcdStateId)
  {
    default:
    case LcdState.Inactive:
      if(buttonMainState || buttonPlusState || buttonMinusState)
      {
        lcd.display();
        lcdStateId = LcdState.Status;
        firstDrawLcdStatus();
        digitalWrite(pinLcdV0, HIGH);
        digitalWrite(pinLcdLedPlus, HIGH);
      }
      else
      {
        buttonPressed = false;
      }
      break;
    case LcdState.Status:
      if(buttonMainState)
      {
        lcdStateId = LcdState.Temp;
        firstDrawLcdTemp(tempStatus.ThermTemp);
      }
      else if(buttonPlusState)
      {
        lcdStateId = LcdState.HeaterSetting;
        firstDrawLcdSetting("Heating", tempHeaterStart);
      }
      else if(buttonMinusState)
      {
        lcdStateId = LcdState.CoolerSetting;
        firstDrawLcdSetting("Cooling", tempCoolerStart);
      }
      else
      {
        buttonPressed = false;
        if(tempStatus.TempStateChanged)
        {
          redrawLcdStatus();
        }
      }
      break;
    case LcdState.Temp:
      if(buttonMainState)
      {
        lcdStateId = LcdState.Status;
        firstDrawLcdStatus();
      }
      else if(buttonPlusState)
      {
        lcdStateId = LcdState.HeaterSetting;
        firstDrawLcdSetting("Heating", tempHeaterStart);
      }
      else if(buttonMinusState)
      {
        lcdStateId = LcdState.CoolerSetting;
        firstDrawLcdSetting("Cooling", tempCoolerStart);
      }
      else
      {
        buttonPressed = false;
        redrawLcdTemp(tempStatus.ThermTemp);
      }
      break;
    case LcdState.CoolerSetting:
      if(buttonMainState)
      {
        lcdStateId = LcdState.Status;
        firstDrawLcdStatus();
      }
      else if(buttonPlusState || buttonMinusState)
      {
        tempSettingUpdateMax = maxTemp;
        tempSettingUpdateMin = tempHeaterEnd + 5;
        lcdStateId = LcdState.CoolerSettingUpdate;
        if(buttonPlusState)
        {
          tempSettingUpdate = tempCoolerStart;
          changeTempSettingUpdate(1.0);
        }
        else
        {
          tempSettingUpdate = tempCoolerStart;
          changeTempSettingUpdate(-1.0);
        }
        firstDrawLcdSettingUpdate();
      }
      else
      {
        buttonPressed = false;
      }
      break;
    case LcdState.HeaterSetting:
      if(buttonMainState)
      {
        lcdStateId = LcdState.Status;
        firstDrawLcdStatus();
      }
      else if(buttonPlusState || buttonMinusState)
      {
        lcdStateId = LcdState.HeaterSettingUpdate;
        tempSettingUpdateMax = tempCoolerEnd - 5;
        tempSettingUpdateMin = minTemp;
        if(buttonPlusState)
        {
          tempSettingUpdate = tempHeaterStart;
          changeTempSettingUpdate(1.0);
        }
        else
        {
          tempSettingUpdate = tempHeaterStart;
          changeTempSettingUpdate(-1.0);
        }
        firstDrawLcdSettingUpdate();
      }
      else
      {
        buttonPressed = false;
      }
      break;
    case LcdState.CoolerSettingUpdate:
      if(buttonMainState)
      {
        lcdStateId = LcdState.CoolerSetting;
        tempCoolerStart = tempSettingUpdate;
        writeFloatToEEPROM(adressTempCoolerStart, tempCoolerStart);
        tempCoolerEnd = tempSettingUpdate - 5;
        exitLcdSettingUpdate();
      }
      else if(buttonPlusState)
      {
        changeTempSettingUpdate(1.0);
        redrawLcdSettingUpdate();
      }
      else if(buttonMinusState)
      {
        changeTempSettingUpdate(-1.0);
        redrawLcdSettingUpdate();
      }
      else
      {
        buttonPressed = false;
      }
      break;
    case LcdState.HeaterSettingUpdate:
      if(buttonMainState)
      {
        lcdStateId = LcdState.HeaterSetting;
        tempHeaterStart = tempSettingUpdate;
        writeFloatToEEPROM(adressTempHeaterStart, tempHeaterStart);
        tempHeaterEnd = tempSettingUpdate + 5;
        exitLcdSettingUpdate();
      }
      else if(buttonPlusState)
      {
        changeTempSettingUpdate(1.0);
        redrawLcdSettingUpdate();
      }
      else if(buttonMinusState)
      {
        changeTempSettingUpdate(-1.0);
        redrawLcdSettingUpdate();
      }
      else
      {
        buttonPressed = false;
      }
      break;
  }
  if(buttonPressed)
  {
    delayLcdSleep();
  }
  else
  {
    checkAndSetLcdSleep();
  }
}

bool checkAndSetLcdSleep()
{
  //TODO add decision to sleep the lcd
  if(schedulerEvents[SchedulerScreenShutoffEventId].IsScheduleElapsed())
  {
    switch(lcdStateId)
    {
      case LcdState.CoolerSettingUpdate:
      case LcdState.HeaterSettingUpdate:
        exitLcdSettingUpdate();
        break;
      default:
        break;
    }
    lcdStateId = LcdState.Inactive;
    digitalWrite(pinLcdV0, LOW);
    digitalWrite(pinLcdLedPlus, LOW);
    lcd.clear();
    lcd.noDisplay();
  }
  return false;
}

void delayLcdSleep()
{
  schedulerEvents[SchedulerScreenShutoffEventId].SetNextRunOffset(120);
}

void firstDrawLcdStatus()
{
  redrawLcdStatus();
}

void redrawLcdStatus()
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Current Temp: ");
  lcd.setCursor(0, 1);
  switch(tempStateId)
  {
    case TempState.Heater:
      lcd.print("Heating");
      break;
    case TempState.Cooler:
      lcd.print("Cooling");
      break;
    case TempState.NoAction:
    default:
      lcd.print("Idle");
      break;
  }
  return;
}
void firstDrawLcdTemp(float temp)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Current temp: ");
  redrawLcdTemp(temp);
  return;
}
void redrawLcdTemp(float temp)
{
  lcd.setCursor(0, 1);
  lcd.print(temp);
  lcd.print(" C");
  ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
  lcd.print("       ");
  return;
}
void firstDrawLcdSetting(String mode, float targetTemp)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(mode);
  lcd.print(" to: ");
  redrawLcdSetting(targetTemp);
  return;
}
void redrawLcdSetting(float targetTemp)
{
  lcd.setCursor(0, 1);
  lcd.print(targetTemp);
  ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
  lcd.print(" C   ");
  return;
}
void firstDrawLcdSettingUpdate()
{
  lcd.blink();
  redrawLcdSettingUpdate();
  return;
}
void changeTempSettingUpdate(float change)
{
  tempSettingUpdate = tempSettingUpdate + change;
  if(tempSettingUpdate < tempSettingUpdateMin)
  {
    tempSettingUpdate = tempSettingUpdateMin;
  }
  else if(tempSettingUpdate > tempSettingUpdateMax)
  {
    tempSettingUpdate = tempSettingUpdateMax;
  }
}
void redrawLcdSettingUpdate()
{
  lcd.setCursor(0, 1);
  lcd.print(tempSettingUpdate);
  lcd.print(" C ");
  if(tempSettingUpdate == tempSettingUpdateMin || tempSettingUpdate == tempSettingUpdateMax )
  {
    lcd.print("Limit");
  }
  lcd.print("       ");
  ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
  lcd.setCursor(2, 1);
  return;
}
void exitLcdSettingUpdate()
{
  ParamData params[] = {ParamData(false, String(tempCoolerStart), "min"), ParamData(false, String(tempHeaterStart), "max")};
  sendSerialMessage(serialCauseUpdateRange, params, sizeof params/sizeof params[0]);
  lcd.noBlink();
  return;
}

void checkComunicationSchedule(float thermTemp)
{
  if(schedulerEvents[SchedulerReportMeasurmentEventId].IsScheduleElapsed())
  {
    schedulerEvents[SchedulerReportMeasurmentEventId].SetNextRunOffset(reportMeasumentDelay);
    ParamData params[] = {ParamData(false, String(thermTemp), "temp")};
    sendSerialMessage(serialCauseTempOut, params, sizeof params/sizeof params[0]);
  }
}

void sendSerialMessage(String cause, ParamData params[], int itemCount)
{
  Serial.print("{ \"cause\": \"");
  Serial.print(cause);
  Serial.print("\"");
  for (int i=0; i<itemCount; i++) {
    Serial.print(", \"");
    Serial.print(params[i].ParamName);
    Serial.print("\": ");
    if(params[i].IsStringDatatype)
    {
      Serial.print("\"");
    }
    Serial.print(params[i].ValueString);
    if(params[i].IsStringDatatype)
    {
      Serial.print("\"");
    }
  }
  Serial.println("}");
}