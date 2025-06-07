#include <LiquidCrystal.h>
#include <EEPROM.h>

#define pinCooler 6
#define pinHeater  7
#define pinLcdV0 9
#define pinLcdLedPlus 8
#define pinThermometer A5
#define pinButtonMain A4
#define pinButtonPlus A3
#define pinButtonMinus A2
#define minTemp -50
#define tempPerVolt 100
#define maxTemp minTemp + 5 * tempPerVolt

#define SchedulerScreenShutoffEventId 0
#define SchedulerMeasurmentEventId 1
#define SchedulerSendMeasurmentEventId 2
#define SchdulerMaxSeconds UINT64_MAX/1000

#define TempStateNoAction 1
#define TempStateCooler 2
#define TempStateHeater 3

//#define IsDebugActive 1
#ifdef IsDebugActive
#define DebugTempCoolerStart 70
#define DebugTempHeaterStart 50
#define DebugMeasurementDelay 1
#define DebugSendMeasurementDelay 4
#endif

#ifndef Scheduler
  #define schedulerSensitivity 1000

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
          if(sheduledTime > SchdulerMaxSeconds)
          {
            sheduledTime = sheduledTime - SchdulerMaxSeconds;
          }
          else
          {
            //scheduled time was less than SchdulerMaxSeconds, run it (may run it next loop in the rare case where sheduled time is 0)
            sheduledTime = 0;
          }
        }
      }
      bool IsScheduleElapsed(unsigned long curentSchedulerTimestamp)
      {
        if(isActive && sheduledTime < curentSchedulerTimestamp)
        {
          isActive = false;
          return true;
        }
        return false;
      }
      // bool IsActive()
      // {
      //   return isActive;
      // }
      void SetNextRun(unsigned long nextRun)
      {
        isActive = true;
        sheduledTime = nextRun;
      }
      void SetNextRunOffsetFromTime(unsigned long nextRunOffset, unsigned long offsetFrom)
      {
        isActive = true;
        sheduledTime = offsetFrom + nextRunOffset;
      }
      void SetNextRunOffsetFromSheduledTime(unsigned long nextRunOffset)
      {
        isActive = true;
        sheduledTime = sheduledTime + nextRunOffset;
      }
  };

  class Scheduler {
    private:
      SchedulerEvent schedulerEvents[3];
      unsigned long lastSchedulerTimestamp = 0LU;
      unsigned long curentSchedulerTimestamp = 0LU;   
    public:
      Scheduler()
      {
        schedulerEvents[SchedulerScreenShutoffEventId] = SchedulerEvent();
        schedulerEvents[SchedulerMeasurmentEventId] = SchedulerEvent();
        schedulerEvents[SchedulerSendMeasurmentEventId] = SchedulerEvent();
      }
      unsigned long GetCurrentTimestamp()
      {
        return curentSchedulerTimestamp;
      }
      unsigned long GetTimeSinceTimestamp(unsigned long timestamp)
      {
        unsigned long timeElapsed = 0;
        if(curentSchedulerTimestamp < timestamp)
        {
          timeElapsed = SchdulerMaxSeconds;
        }
        timeElapsed = timeElapsed + curentSchedulerTimestamp - timestamp;
        return timeElapsed;
      }
      void SchedulerUpdate()
      {
        //jedna iterace loop je +- 1000ms
        //z tohoto duvodu nepotřebujem tak moc přesnou konverzi z ms od startu do schuler timestampu
        //nechceme 1:1 vztah mezi millis a timestampem protože milis overflowne jednou za ~51 dni, což by mohlo způsobit selhani scheduleru;
        
        curentSchedulerTimestamp =  millis() / schedulerSensitivity;
        if(lastSchedulerTimestamp > curentSchedulerTimestamp)
        {
          //došlo k overflow millis()
          byte itemCount =sizeof schedulerEvents/sizeof schedulerEvents[0];
          for (byte i=0; i<itemCount; i++) {
              schedulerEvents[i].CorrectSchedulerOverflow();
          }
        }
        lastSchedulerTimestamp = curentSchedulerTimestamp;
      }
      bool IsScheduleElapsed(byte index)
      {
        if(schedulerEvents < 0 || schedulerEvents >= 3)
        {
          return schedulerEvents[index].IsScheduleElapsed(curentSchedulerTimestamp);
        }
      }
      void SetNextRun(byte index, unsigned long nextRun)
      {
        if(schedulerEvents < 0 || schedulerEvents >= 3)
        {
          schedulerEvents[index].SetNextRun(nextRun);
        }
      }
      void SetNextRunOffsetFromTime(byte index, unsigned long nextRun, unsigned long offsetFrom)
      {
        if(schedulerEvents < 0 || schedulerEvents >= 3)
        {
          schedulerEvents[index].SetNextRunOffsetFromTime(nextRun, offsetFrom);
        }
      }
      void SetNextRunOffsetFromCurrentTime(byte index, unsigned long nextRun)
      {
        if(schedulerEvents < 0 || schedulerEvents >= 3)
        {
          schedulerEvents[index].SetNextRunOffsetFromTime(nextRun, curentSchedulerTimestamp);
        }
      }
      bool SetNextRunOffsetFromSheduledTime(byte index, unsigned long nextRun)
      {
        if(schedulerEvents < 0 || schedulerEvents >= 3)
        {
          schedulerEvents[index].SetNextRunOffsetFromSheduledTime(nextRun);
        }
      }
  };
#endif

#ifndef EepromController
  #define adressTempCoolerStart 0
  #define adressTempHeaterStart 4
  #define adressMeasurementDelay 8
  #define adressSendMeasurementDelay 12
  class EepromController
  {
    private:
      
      typedef union
      {
        float number;
        uint8_t bytes[4];
      } EEPROM_FLOAT;
      typedef union
      {
        unsigned int number;
        uint8_t bytes[4];
      } EEPROM_UINT;

      bool readFloatFromEEPROM(byte adress, float* outputValue)
      {
        bool allNoValue = true;
        
        EEPROM_FLOAT eepromValue;
        for(byte offset = 0;offset < 4; offset++)
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
      void writeFloatToEEPROM(byte adress, float value)
      {
        float currentValue;
        if(readFloatFromEEPROM(adress, &currentValue) && currentValue == value)
        {
          return;
        }
        EEPROM_FLOAT eepromValue;
        eepromValue.number = value;
        for(byte offset = 0;offset < 4; offset++)
        {
          EEPROM.write(adress + offset, eepromValue.bytes[offset]);
        }
      }

      bool readUnsignedIntFromEEPROM(byte adress, unsigned int* outputValue)
      {
        bool allNoValue = true;
        
        EEPROM_UINT eepromValue;
        for(byte offset = 0;offset < 2; offset++)
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

      void writeUnsignedIntToEEPROM(byte adress, unsigned int value)
      {
        int currentValue;
        if(readUnsignedIntFromEEPROM(adress, &currentValue) && currentValue == value)
        {
          return;
        }
        EEPROM_UINT eepromValue;
        eepromValue.number = value;
        for(byte offset = 0;offset < 2; offset++)
        {
          EEPROM.write(adress + offset, eepromValue.bytes[offset]);
        }
      }

    public:
      EepromController(){}
      float ReadTempCoolerStart()
      {
        #ifdef IsDebugActive
        return DebugTempCoolerStart;
        #endif
        float tempCoolerStart;
        if(!readFloatFromEEPROM(adressTempCoolerStart, &tempCoolerStart))
        {
          tempCoolerStart = 70;
        }
        return tempCoolerStart;
      }

      float ReadTempHeaterStart()
      {
        #ifdef IsDebugActive
        return DebugTempHeaterStart;
        #endif
        float tempHeaterStart;
        if(!readFloatFromEEPROM(adressTempHeaterStart, &tempHeaterStart))
        {
          tempHeaterStart = 50;
        }
        return tempHeaterStart;
      }

      unsigned int ReadMeasurementDelay()
      {
        #ifdef IsDebugActive
        return DebugMeasurementDelay;
        #endif
        unsigned int measurementDelay;
        if(!readUnsignedIntFromEEPROM(adressMeasurementDelay, &measurementDelay))
        {
          measurementDelay = 120; //2 min
        }
        return measurementDelay;
      }

      unsigned int ReadSendMeasurementDelay()
      {
        #ifdef IsDebugActive
        return DebugSendMeasurementDelay;
        #endif
        unsigned int sendMeasurementDelay;
        if(!readUnsignedIntFromEEPROM(adressSendMeasurementDelay, &sendMeasurementDelay))
        {
          sendMeasurementDelay = 1200; //20 min
        }
        return sendMeasurementDelay;
      }

      void WriteTempCoolerStart(float value)
      {
        #ifdef IsDebugActive
        return;
        #endif
        writeFloatToEEPROM(adressTempCoolerStart, value);
      }

      void WriteTempHeaterStart(float value)
      {
        #ifdef IsDebugActive
        return;
        #endif
        writeFloatToEEPROM(adressTempHeaterStart, value);
      }

      void WriteMeasurementDelay(int value)
      {
        #ifdef IsDebugActive
        return;
        #endif
        writeUnsignedIntToEEPROM(adressMeasurementDelay, value);
      }

      void WriteSendMeasurementDelay(int value)
      {
        #ifdef IsDebugActive
        return;
        #endif
        writeUnsignedIntToEEPROM(adressSendMeasurementDelay, value);
      }

  };
#endif

#ifndef TempConfig
  class TempConfig
  {
    private:
      float tempCoolerStart;
      float tempCoolerEnd;
      float tempHeaterStart;
      float tempHeaterEnd;
      unsigned int measurementDelay;
      unsigned int sendMeasurementDelay;
      unsigned long lastSync = 0;
      bool isConfigModified = false;
      unsigned long lastChangeAfterSync = 0;
      EepromController* EepromControllerInstance;
      Scheduler* SchedulerInstance;
      void SetTempCoolerStartInternal(float value)
      {
        tempCoolerStart = value;
        tempCoolerEnd = tempCoolerStart - 5;
      }
      void SetTempHeaterStartInternal(float value)
      {
        tempHeaterStart = value;
        tempHeaterEnd = tempHeaterStart + 5;
      }
      void setConfigModified()
      {
        isConfigModified = true;
        lastChangeAfterSync = SchedulerInstance->GetTimeSinceTimestamp(lastSync);
      }
    public:
      TempConfig(const EepromController* eepromController, const Scheduler* scheduler)
      {
        EepromControllerInstance = eepromController;
        SchedulerInstance = scheduler;
        float tempCoolerStartLocal = EepromControllerInstance->ReadTempCoolerStart();
        float tempHeaterStartLocal = EepromControllerInstance->ReadTempHeaterStart();
        measurementDelay = EepromControllerInstance->ReadMeasurementDelay();
        sendMeasurementDelay = EepromControllerInstance->ReadSendMeasurementDelay();

        SetTempCoolerStartInternal(tempCoolerStartLocal);
        SetTempHeaterStartInternal(tempHeaterStartLocal);
      }
      float GetTempCoolerEnd()
      {
        return tempCoolerEnd;
      }
      float GetTempHeaterEnd()
      {
        return tempHeaterEnd;
      }
      float GetTempCoolerStart()
      {
        return tempCoolerStart;
      }
      float GetTempHeaterStart()
      {
        return tempHeaterStart;
      }
      void SetTempCoolerStart(float value, bool localUpdate = true)
      {
        if(localUpdate)
        {
          setConfigModified();
        }
        EepromControllerInstance->WriteTempCoolerStart(value);
        SetTempCoolerStartInternal(value);
      }
      void SetTempHeaterStart(float value, bool localUpdate = true)
      {
        if(localUpdate)
        {
          setConfigModified();
        }
        EepromControllerInstance->WriteTempHeaterStart(value);
        SetTempHeaterStartInternal(value);
      }
      unsigned int GetMeasurementDelay()
      {
        return measurementDelay;
      }
      unsigned int GetSendMeasurementDelay()
      {
        return sendMeasurementDelay;
      }
      void SetMeasurementDelay(unsigned int value, bool localUpdate = true)
      {
        if(localUpdate)
        {
          setConfigModified();
        }
        EepromControllerInstance->WriteMeasurementDelay(value);
        measurementDelay = value;
      }
      void SetSendMeasurementDelay(unsigned int value, bool localUpdate = true)
      {
        if(localUpdate)
        {
          setConfigModified();
        }
        EepromControllerInstance->WriteSendMeasurementDelay(value);
        sendMeasurementDelay = value;
      }
      unsigned long GetConfigUpdateOffset()
      {
        unsigned long lastChangeAfterSyncLocal;
        if(isConfigModified)
        {
          if(lastChangeAfterSync == 0)
          {
            lastChangeAfterSyncLocal = 1;
          }
          else
          {
            lastChangeAfterSyncLocal = lastChangeAfterSync;
          }
        }
        else
        {
          lastChangeAfterSyncLocal = 0;
        }
        lastSync = SchedulerInstance->GetCurrentTimestamp();
        lastChangeAfterSync = 0;
        isConfigModified = false;
        return lastChangeAfterSyncLocal;
      }
  };
#endif

#ifndef TempStatus
  class TempStatus
  {
    private:
      TempConfig* TempConfigInstance;
    public:
      float ThermTemp;
      bool TempStateChanged;
      byte TempStateId;
      TempStatus(const TempConfig* tempConfig)
      {
        TempConfigInstance = tempConfig;
        TempStateId = TempStateNoAction;
        ThermTemp= 0;
        TempStateChanged = false;
      } 
    void UpdateTempRegulation()
    {
      int thermVal = analogRead(pinThermometer);
      // analogRead vrací číslo mezi 0 a 1023 proto deleni 1024, nasobení 5 je protože to je maximalni napětí
      float thermVolt = (thermVal / 1024.0) * 5;
      //TODO double check expresion
      ThermTemp = minTemp + thermVolt * tempPerVolt;

      switch(TempStateId)
      {
        case TempStateNoAction:
        default:
          if(ThermTemp < TempConfigInstance->GetTempHeaterStart())
          {
            digitalWrite(pinHeater, HIGH);
            TempStateId = TempStateHeater;
            TempStateChanged = true;
          }
          else if (ThermTemp > TempConfigInstance->GetTempCoolerStart())
          {
            digitalWrite(pinCooler, HIGH);
            TempStateId = TempStateCooler;
            TempStateChanged = true;
          }
          break;
        case TempStateCooler:
          if(ThermTemp < TempConfigInstance->GetTempCoolerEnd())
          {
            digitalWrite(pinCooler, LOW);
            TempStateId = TempStateNoAction;
            TempStateChanged = true;
          }
          break;
        case TempStateHeater:
          if(ThermTemp > TempConfigInstance->GetTempHeaterEnd())
          {
            digitalWrite(pinHeater, LOW);
            TempStateId = TempStateNoAction;
            TempStateChanged= true;
          }
          break;
      }
    }
  };
#endif

#ifndef DataMeasurement
  class DataPoint {
    public:
      DataPoint(){}
      unsigned long timeOffset;
      int tempState;
      float temp;
  };
  class DataMeasurement {
    private:
      Scheduler* SchedulerInstance;
      TempStatus* TempStatusInstance;
      TempConfig* TempConfigInstance;
      unsigned long lastTimeStamp;

      byte usedDataPoints = 0;
      byte filledDataPoints = 0;
      void MeasureData()
      {
        if(filledDataPoints == usedDataPoints)
        {
          Data[usedDataPoints] = DataPoint{};
          filledDataPoints++;
        }            
        Data[usedDataPoints].tempState = TempStatusInstance->TempStateId;
        Data[usedDataPoints].timeOffset = SchedulerInstance->GetTimeSinceTimestamp(lastTimeStamp);
        Data[usedDataPoints].temp = TempStatusInstance->ThermTemp;
        usedDataPoints++;
        lastTimeStamp = SchedulerInstance->GetCurrentTimestamp();
      }
    public:
      //has to be public to be reasonably acessible
      DataPoint Data[130];
      int GetDataPointCount()
      {
        int returnUsedDataPoints = usedDataPoints;
        usedDataPoints = 0;
        return returnUsedDataPoints;
      }
      DataMeasurement(const Scheduler* scheduler, const TempStatus* tempStatus, const TempConfig* tempConfig)
      {
        SchedulerInstance = scheduler;
        TempStatusInstance = tempStatus;
        TempConfigInstance = tempConfig;
        lastTimeStamp = SchedulerInstance->GetCurrentTimestamp();
        SchedulerInstance->SetNextRun(SchedulerMeasurmentEventId, TempConfigInstance->GetMeasurementDelay());
      };
      void CheckMeasurementSchedule()
      {
        if(SchedulerInstance->IsScheduleElapsed(SchedulerMeasurmentEventId))
        {
          SchedulerInstance->SetNextRunOffsetFromSheduledTime(SchedulerMeasurmentEventId, TempConfigInstance->GetMeasurementDelay());
          MeasureData();
        }
      }
  };
#endif

#ifndef DataSender

  //space is used as separator and at message start
  #define maxHeaderSize 16
  //9 - spaces and param identifier, 10 - param value
  #define maxParamSize 11
  
  #define serialCauseSendTemp "sendTemp"
  #define serialCauseConfigReq "configReq"
  
  #define StateAwaitHeader 0
  #define StateReadParam 1
  #define StateEvaluateMessage 2

  #define messageInConfigUpdateTypeId 0
  #define messageInParamIdentTempHeaterStart 0
  #define messageInParamIdentTempCoolerStart 1
  #define messageInParamIdentMeasurementDelay 2
  #define messageInParamIdentSendMeasurementDelay 3


  #define datatypeFloat 0
  #define datatypeULong 1
  #define datatypeUInt 2
  #define datatypeMesasurementData 3
  
  #define paramNameTimestamp "timestamp"
  #define paramNameMin "min"
  #define paramNameMax "max"
  #define paramNameSendInterval "sendInterval"
  #define paramNameInterval "interval"
  #define paramNameMeasurementData "measurementData"
  #define paramNameFirstSend "firstSend"

  class ParamData {
    public:
      ParamData(byte datatype, char* paramName)
      {
        Datatype = datatype;
        ParamName = paramName;
      }
      byte Datatype;
      unsigned long ValueULong;
      unsigned int ValueUInt;
      float ValueFloat;
      char* ParamName;
  };
  
  class Packet{
    private:
      byte bytesWriten = 0;
    public:
      Packet(){}
      byte MessageTypeId = -1;
      int MessageState = StateAwaitHeader;
      byte ParamCount = -1;
      byte ParamsRead = 0;
      String ParamValues[4];
      void ResetData()
      {
        MessageState = StateAwaitHeader;
        MessageTypeId = -1;
        ParamCount = -1;
        ParamsRead = 0;
      }
  };
  
  class DataSender {
    private:
      Scheduler* SchedulerInstance;
      TempConfig* TempConfigInstance;
      DataMeasurement* DataMeasurementInstance;
      Packet readHeaderData;
      bool firstLoop = true;
      void sendSerialMessage(char* cause, ParamData params[], byte itemCount)
      {
        Serial.print(F("{ \"cause\": \""));
        Serial.print(cause);
        Serial.print(F("\""));
        for (byte i=0; i<itemCount; i++) {
          Serial.print(F(", \""));
          Serial.print(params[i].ParamName);
          Serial.print(F("\": "));
          switch(params[i].Datatype)
          {
            case datatypeFloat:
              Serial.print(params[i].ValueFloat);
              break;
            case datatypeULong:
              Serial.print(params[i].ValueULong);
              break;
            case datatypeUInt:
              Serial.print(params[i].ValueUInt);
              break;
            case datatypeMesasurementData:
              int maxDataPointId = DataMeasurementInstance->GetDataPointCount() - 1;
              
              Serial.print(F("["));
              for(int i = 0; i <= maxDataPointId; i++)
              {
                Serial.print(F("{"));
                Serial.print(F("\"timeOffset\":"));
                Serial.print(DataMeasurementInstance->Data[i].timeOffset);
                Serial.print(F(",\"state\":"));
                Serial.print(DataMeasurementInstance->Data[i].tempState);
                Serial.print(F(",\"temperature\":"));
                Serial.print(DataMeasurementInstance->Data[i].temp);
                Serial.print(F("}"));
                if(i != maxDataPointId)
                {
                  Serial.print(F(","));
                }
              }
              Serial.print(F("]"));
              break;

            default:
              break;
          }
        }
        Serial.println(F("}"));
      };

      byte minBufferSize = maxHeaderSize;
      void SendConfigRequest(unsigned long configChangeOffset, bool firstSend = false)
      {
        ParamData params[] = { ParamData(datatypeULong, paramNameTimestamp), ParamData(datatypeFloat, paramNameMin), ParamData(datatypeFloat, paramNameMax), ParamData(datatypeUInt, paramNameInterval), ParamData(datatypeUInt, paramNameSendInterval), ParamData(datatypeUInt, paramNameFirstSend) };
        params[0].ValueULong = configChangeOffset;
        params[1].ValueFloat = TempConfigInstance->GetTempCoolerStart();
        params[2].ValueFloat = TempConfigInstance->GetTempHeaterStart();
        params[3].ValueUInt = TempConfigInstance->GetMeasurementDelay();
        params[4].ValueUInt = TempConfigInstance->GetSendMeasurementDelay();
        params[5].ValueUInt = firstSend ? 1 : 0;
        sendSerialMessage(serialCauseConfigReq, params, sizeof params/sizeof params[0]);
      };
    public:
      DataSender(const Scheduler* scheduler, const TempConfig* tempConfig, const DataMeasurement* dataMeasurement)
      {
        SchedulerInstance = scheduler;
        TempConfigInstance = tempConfig;
        DataMeasurementInstance = dataMeasurement;
        SchedulerInstance->SetNextRun(SchedulerSendMeasurmentEventId, TempConfigInstance->GetSendMeasurementDelay());
      };
       
      void CheckSerialIn()
      {
        int unreadBytes = Serial.available();
        if(unreadBytes >= minBufferSize)
        {
          String readString;
          int messageIdent;
          bool messageTypeNotFound;
          switch(readHeaderData.MessageState)
          {
            case StateAwaitHeader:
              //mesage start string
              readString = Serial.readStringUntil(' ');
              if(readString != "Msg")
              {
                break;
              }
              //messageType
              readString = Serial.readStringUntil(' ');

              messageTypeNotFound = false;
              if(readString == "CfgUp")
              {
                readHeaderData.MessageTypeId = messageInConfigUpdateTypeId;
                for(int i =0; i<4; i++)
                {
                  readHeaderData.ParamValues[i] = "";
                }
              }
              else
              {
                messageTypeNotFound = true;
              }
              if(messageTypeNotFound)
              {
                break;
              }
              readString = Serial.readStringUntil(' ');
              if(readString != "PrmC")
              {
                readHeaderData.ResetData();
                break;
              }
              readString = Serial.readStringUntil(' ');
              if(readString.length() != 1 || readString[0] < '0' || readString[0]  > '9' )
              {
                readHeaderData.ResetData();
                break;
              }
              readHeaderData.ParamCount = (byte)readString[0] - 48;
              minBufferSize = maxParamSize;
              readHeaderData.MessageState = StateReadParam;
              break;
            case StateReadParam:
              readString = Serial.readStringUntil(' ');
              if(readString == "TmpHeat")
              {
                messageIdent = messageInParamIdentTempHeaterStart;
              }
              else if(readString == "TmpCool")
              {
                messageIdent = messageInParamIdentTempCoolerStart;
              }
              else if(readString == "MeasDly")
              {
                messageIdent = messageInParamIdentMeasurementDelay;
              }
              else if(readString == "SendDly")
              {
                messageIdent = messageInParamIdentSendMeasurementDelay;
              }
              else
              {
                readHeaderData.ResetData();
                minBufferSize = maxHeaderSize;
                break;
              }
              readString = Serial.readStringUntil(' ');
              readHeaderData.ParamValues[messageIdent] = readString;
              readHeaderData.ParamsRead++;
              if(readHeaderData.ParamsRead < readHeaderData.ParamCount)
              {
                break;
              }
              readHeaderData.MessageState = StateEvaluateMessage;
              minBufferSize = 0;
            case StateEvaluateMessage:
              switch(readHeaderData.MessageTypeId)
              {
                case messageInConfigUpdateTypeId:
                  for(int i = 0; i < 4; i++)
                  {
                    if(readHeaderData.ParamValues[i] == "")
                    {
                      continue;
                    }
                    else
                    {
                      switch(i)
                      {
                        case messageInParamIdentTempHeaterStart:
                          TempConfigInstance->SetTempHeaterStart(readHeaderData.ParamValues[i].toFloat(), false);
                          break;
                        case messageInParamIdentTempCoolerStart:
                          TempConfigInstance->SetTempCoolerStart(readHeaderData.ParamValues[i].toFloat(), false);
                          break;
                        case messageInParamIdentMeasurementDelay:
                          TempConfigInstance->SetMeasurementDelay(readHeaderData.ParamValues[i].toInt(), false);
                          break;
                        case messageInParamIdentSendMeasurementDelay:
                          TempConfigInstance->SetSendMeasurementDelay(readHeaderData.ParamValues[i].toInt(), false);
                          break;
                      }
                    }
                  }
                  break;
              }
              readHeaderData.ResetData();
              minBufferSize = maxHeaderSize;
              break;
            default:
              break;
          }
        }
      }\

      void CheckComunicationSchedule()
      {
        if(firstLoop)
        {
          SendConfigRequest(0, true);
          firstLoop = false;
        }
        if(SchedulerInstance->IsScheduleElapsed(SchedulerSendMeasurmentEventId))
        {
          SchedulerInstance->SetNextRunOffsetFromSheduledTime(SchedulerSendMeasurmentEventId, TempConfigInstance->GetSendMeasurementDelay());
          ParamData params[] = { ParamData(datatypeMesasurementData, paramNameMeasurementData) };
          sendSerialMessage(serialCauseSendTemp, params, sizeof params / sizeof params[0]);
          unsigned long configChangeOffset = TempConfigInstance->GetConfigUpdateOffset();
          SendConfigRequest(configChangeOffset);
        }
      }
  };  
#endif

#ifndef LcdControler
  LiquidCrystal lcd(12, 11, 5, 4, 3, 2);
  #define LcdStateInactive 0
  #define LcdStateStatus 1
  #define LcdStateTemp 2
  #define LcdStateCoolerSetting 3
  #define LcdStateCoolerSettingUpdate 4
  #define LcdStateHeaterSetting 5
  #define LcdStateHeaterSettingUpdate 6

  #define ModeIsHeating true
  #define ModeIsCooling false

  class LcdControler {
    private:
      Scheduler* SchedulerInstance;
      TempConfig* TempConfigInstance;
      TempStatus* TempStatusInstance;
      int lcdStateId = LcdStateInactive;
      float tempSettingUpdateMax;
      float tempSettingUpdateMin;
      float tempSettingUpdate;
      
      void checkAndSetLcdSleep() {
        if (SchedulerInstance->IsScheduleElapsed(SchedulerScreenShutoffEventId)) {
          switch (lcdStateId) {
            case LcdStateCoolerSettingUpdate:
            case LcdStateHeaterSettingUpdate:
              exitLcdSettingUpdate();
              break;
            default:
              break;
          }
          lcdStateId = LcdStateInactive;
          digitalWrite(pinLcdV0, LOW);
          digitalWrite(pinLcdLedPlus, LOW);
          lcd.clear();
          lcd.noDisplay();
        }
      }

      void delayLcdSleep() {
        SchedulerInstance->SetNextRunOffsetFromCurrentTime(SchedulerScreenShutoffEventId, 120);
      }

      void firstDrawLcdStatus() {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(F("Current state: "));
        redrawLcdStatus();
      }

      void redrawLcdStatus() {
        lcd.setCursor(0, 1);
        switch(TempStatusInstance->TempStateId)
        {
          default:
          case TempStateNoAction:
            lcd.print(F("Idle   "));
            break;
          case TempStateCooler:
            lcd.print(F("Cooling"));
            break;
          case TempStateHeater:
            lcd.print(F("Heating"));
            break;
        }
        return;
      }
      void firstDrawLcdTemp(float temp) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print(F("Current temp: "));
        redrawLcdTemp(temp);
        return;
      }
      void redrawLcdTemp(float temp) {
        lcd.setCursor(0, 1);
        lcd.print(temp);
        lcd.print(F(" C"));
        ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
        lcd.print(F("       "));
        return;
      }
      void firstDrawLcdSetting(bool isModeHeating, float targetTemp) {
        lcd.clear();
        lcd.setCursor(0, 0);
        if(isModeHeating)
        {
          lcd.print(F("Heating"));
        }
        else
        {
          lcd.print(F("Cooling"));
        }
        lcd.print(F(" to: "));
        redrawLcdSetting(targetTemp);
        return;
      }
      void redrawLcdSetting(float targetTemp) {
        lcd.setCursor(0, 1);
        lcd.print(targetTemp);
        ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
        lcd.print(F(" C   "));
        return;
      }
      void firstDrawLcdSettingUpdate() {
        lcd.blink();
        redrawLcdSettingUpdate();
        return;
      }
      void changeTempSettingUpdate(float change) {
        tempSettingUpdate = tempSettingUpdate + change;
        if (tempSettingUpdate < tempSettingUpdateMin) {
          tempSettingUpdate = tempSettingUpdateMin;
        } else if (tempSettingUpdate > tempSettingUpdateMax) {
          tempSettingUpdate = tempSettingUpdateMax;
        }
      }
      void redrawLcdSettingUpdate() {
        lcd.setCursor(0, 1);
        lcd.print(tempSettingUpdate);
        lcd.print(F(" C "));
        if (tempSettingUpdate == tempSettingUpdateMin || tempSettingUpdate == tempSettingUpdateMax) {
          lcd.print(F("Limit"));
        }
        lcd.print(F("       "));
        ///mezery na konci jsou aby prepsaly konec stringu když se zmenšuje počet tistenejch znaku
        lcd.setCursor(2, 1);
        return;
      }
      void exitLcdSettingUpdate() {
        lcd.noBlink();
        return;
      }
    public:
      LcdControler(const Scheduler* scheduler, const TempConfig* tempConfig, const TempStatus* tempStatus) 
      {
        SchedulerInstance = scheduler;
        TempConfigInstance = tempConfig;
        TempStatusInstance = tempStatus;
        lcd.begin(16, 2);
        lcd.noDisplay();
      };
      void UpdateLcd() {
        int buttonMainVal = analogRead(pinButtonMain);
        bool buttonMainState = buttonMainVal >= 256;
        int buttonPlusVal = analogRead(pinButtonPlus);
        bool buttonPlusState = buttonPlusVal >= 256;
        int buttonMinusVal = analogRead(pinButtonMinus);
        bool buttonMinusState = buttonMinusVal >= 256;
        bool buttonPressed = true;
        switch (lcdStateId) {
          default:
          case LcdStateInactive:
            if (buttonMainState || buttonPlusState || buttonMinusState) {
              lcd.display();
              lcdStateId = LcdStateStatus;
              firstDrawLcdStatus();
              digitalWrite(pinLcdV0, HIGH);
              digitalWrite(pinLcdLedPlus, HIGH);
            } else {
              buttonPressed = false;
            }
            break;
          case LcdStateStatus:
            if (buttonMainState) {
              lcdStateId = LcdStateTemp;
              firstDrawLcdTemp(TempStatusInstance->ThermTemp);
            } else if (buttonPlusState) {
              lcdStateId = LcdStateHeaterSetting;
              firstDrawLcdSetting(ModeIsHeating, TempConfigInstance->GetTempHeaterStart());
            } else if (buttonMinusState) {
              lcdStateId = LcdStateCoolerSetting;
              firstDrawLcdSetting(ModeIsCooling, TempConfigInstance->GetTempCoolerStart());
            } else {
              buttonPressed = false;
              if (TempStatusInstance->TempStateChanged) {
                redrawLcdStatus();
              }
            }
            break;
          case LcdStateTemp:
            if (buttonMainState) {
              lcdStateId = LcdStateStatus;
              firstDrawLcdStatus();
            } else if (buttonPlusState) {
              lcdStateId = LcdStateHeaterSetting;
              firstDrawLcdSetting(ModeIsHeating, TempConfigInstance->GetTempHeaterStart());
            } else if (buttonMinusState) {
              lcdStateId = LcdStateCoolerSetting;
              firstDrawLcdSetting(ModeIsCooling, TempConfigInstance->GetTempCoolerStart());
            } else {
              buttonPressed = false;
              redrawLcdTemp(TempStatusInstance->ThermTemp);
            }
            break;
          case LcdStateCoolerSetting:
            if (buttonMainState) {
              lcdStateId = LcdStateStatus;
              firstDrawLcdStatus();
            } else if (buttonPlusState || buttonMinusState) {
              tempSettingUpdateMax = maxTemp;
              tempSettingUpdateMin = TempConfigInstance->GetTempHeaterEnd() + 5;
              lcdStateId = LcdStateCoolerSettingUpdate;
              tempSettingUpdate = TempConfigInstance->GetTempCoolerStart();
              if (buttonPlusState) {
                changeTempSettingUpdate(1.0);
              } else {
                changeTempSettingUpdate(-1.0);
              }
              firstDrawLcdSettingUpdate();
            } else {
              buttonPressed = false;
            }
            break;
          case LcdStateHeaterSetting:
            if (buttonMainState) {
              lcdStateId = LcdStateStatus;
              firstDrawLcdStatus();
            } else if (buttonPlusState || buttonMinusState) {
              lcdStateId = LcdStateHeaterSettingUpdate;
              tempSettingUpdateMax = TempConfigInstance->GetTempCoolerEnd() - 5;
              tempSettingUpdateMin = minTemp;
              tempSettingUpdate = TempConfigInstance->GetTempHeaterStart();
              if (buttonPlusState) {
                changeTempSettingUpdate(1.0);
              } else {
                changeTempSettingUpdate(-1.0);
              }
              firstDrawLcdSettingUpdate();
            } else {
              buttonPressed = false;
            }
            break;
          case LcdStateCoolerSettingUpdate:
            if (buttonMainState) {
              lcdStateId = LcdStateCoolerSetting;
              TempConfigInstance->SetTempCoolerStart(tempSettingUpdate);
              exitLcdSettingUpdate();
            } else if (buttonPlusState) {
              changeTempSettingUpdate(1.0);
              redrawLcdSettingUpdate();
            } else if (buttonMinusState) {
              changeTempSettingUpdate(-1.0);
              redrawLcdSettingUpdate();
            } else {
              buttonPressed = false;
            }
            break;
          case LcdStateHeaterSettingUpdate:
            if (buttonMainState) {
              lcdStateId = LcdStateHeaterSetting;
              TempConfigInstance->SetTempHeaterStart(tempSettingUpdate);
              exitLcdSettingUpdate();
            } else if (buttonPlusState) {
              changeTempSettingUpdate(1.0);
              redrawLcdSettingUpdate();
            } else if (buttonMinusState) {
              changeTempSettingUpdate(-1.0);
              redrawLcdSettingUpdate();
            } else {
              buttonPressed = false;
            }
            break;
        }
        if (buttonPressed) {
          delayLcdSleep();
        } else if (lcdStateId != LcdStateInactive) {
          checkAndSetLcdSleep();
        }
      }
  };
#endif


Scheduler SchedulerInstance;
EepromController EepromControllerInstance;
TempConfig TempConfigInstance{&EepromControllerInstance, &SchedulerInstance};
TempStatus TempStatusInstance{&TempConfigInstance};
LcdControler LcdControlerInstance{&SchedulerInstance, &TempConfigInstance, &TempStatusInstance};
DataMeasurement DataMeasurementInstance{&SchedulerInstance, &TempStatusInstance, &TempConfigInstance};
DataSender DataSenderInstace{&SchedulerInstance, &TempConfigInstance, &DataMeasurementInstance};

void setup() {
  //DO NOT MOVE THIS OR EVERYTHING BREAKS !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  Serial.begin(9600);
  pinMode(pinCooler, OUTPUT);
  pinMode(pinHeater, OUTPUT);
  pinMode(pinLcdV0, OUTPUT);
  pinMode(pinLcdLedPlus, OUTPUT);

  digitalWrite(pinCooler, LOW);
  digitalWrite(pinHeater, LOW);
  digitalWrite(pinLcdV0, LOW);
  digitalWrite(pinLcdLedPlus, LOW);

}

void loop() {
  SchedulerInstance.SchedulerUpdate();
  DataSenderInstace.CheckSerialIn();
  TempStatusInstance.UpdateTempRegulation();
  LcdControlerInstance.UpdateLcd();
  DataMeasurementInstance.CheckMeasurementSchedule();
  DataSenderInstace.CheckComunicationSchedule();
  delay(1000);
}


